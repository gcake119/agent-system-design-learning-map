"""Bounded portable ZIP files for existing CI artifact file contracts.

No credentials or extra ZIP members. Product qualification remains with owners.
"""
import glob
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import secrets
import shutil
import stat
import struct
import zipfile

MAX_FILES = 4096
MAX_METADATA = 8 * 1024**2


class BundleError(Exception):
    def __init__(self, code):
        super().__init__(code); self.code = code


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True).encode()


def _budget(value):
    if type(value) is not int or not 1 <= value <= 1024**3: raise BundleError('INVALID_BUNDLE_BUDGET')


def _name(value):
    if (not isinstance(value, str) or not value or len(value.encode('utf8')) > 1024
            or '\\' in value or ':' in value or any(ord(c) < 32 for c in value)
            or value.startswith('/') or any(p in ('', '.', '..') for p in value.split('/'))):
        raise BundleError('UNSAFE_BUNDLE_PATH')
    for part in value.split('/'):
        if (part.endswith((' ', '.')) or re.fullmatch(r'(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?', part, re.I)):
            raise BundleError('UNSAFE_BUNDLE_PATH')
    return value


def _regular(path):
    before = path.lstat()
    if not stat.S_ISREG(before.st_mode): raise BundleError('UNSAFE_BUNDLE_PATH')
    fd = os.open(path, os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0) | getattr(os, 'O_NONBLOCK', 0))
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or (info.st_dev, info.st_ino) != (before.st_dev, before.st_ino):
            raise BundleError('UNSAFE_BUNDLE_PATH')
        return os.fdopen(fd, 'rb'), info
    except BaseException:
        os.close(fd); raise


def _destination(path):
    path = Path(path).absolute()
    if '..' in path.parts or any(parent.is_symlink() for parent in path.parents):
        raise BundleError('UNSAFE_BUNDLE_PATH')
    if path.exists() or path.is_symlink(): raise BundleError('BUNDLE_DESTINATION_EXISTS')
    return path


def _hash(source, limit):
    digest, total = hashlib.sha256(), 0
    while block := source.read(min(1024**2, limit - total + 1)):
        total += len(block)
        if total > limit: raise BundleError('BUNDLE_TOO_LARGE')
        digest.update(block)
    return digest.hexdigest(), total


def _receipt(files, receipt, receipt_format, loader):
    if receipt is None: return hashlib.sha256(canonical(files)).hexdigest()
    name = _name(receipt)
    matching = [record for record in files if record['path'] == name]
    if len(matching) != 1: raise BundleError('BUNDLE_RECEIPT_MISSING')
    if receipt_format == 'bytes': return matching[0]['sha256']
    if receipt_format != 'canonical-json' or matching[0]['size'] > 1024**2:
        raise BundleError('INVALID_BUNDLE_RECEIPT')
    def unique(pairs):
        value = {}
        for key, item in pairs:
            if key in value: raise BundleError('INVALID_BUNDLE_RECEIPT')
            value[key] = item
        return value
    raw = loader(name)
    parsed = json.loads(raw, object_pairs_hook=unique,
        parse_constant=lambda _: (_ for _ in ()).throw(BundleError('INVALID_BUNDLE_RECEIPT')))
    return hashlib.sha256(canonical(parsed)).hexdigest()


def _source_paths(patterns, roots, include_hidden):
    if not patterns or not roots: raise BundleError('BUNDLE_MISSING_FILES')
    roots = [Path(p).resolve(strict=True) for p in roots]
    found, bases = {}, []
    for value in patterns:
        if not isinstance(value, str) or not value or value.startswith('!') or '..' in Path(value).parts:
            raise BundleError('UNSAFE_BUNDLE_PATH')
        pattern = Path(value).absolute()
        prefix = Path(pattern.anchor)
        for component in pattern.parts[1:]:
            if glob.has_magic(component): break
            prefix /= component
        base = prefix if prefix.is_dir() else prefix.parent
        bases.append(base)
        for match in glob.iglob(str(pattern), recursive=True, include_hidden=include_hidden):
            path = Path(match)
            candidates = [path]
            if path.is_dir() and not path.is_symlink():
                candidates = []
                for directory, dirs, names in os.walk(path, followlinks=False):
                    if not include_hidden:
                        dirs[:] = [name for name in dirs if not name.startswith('.')]
                        names = [name for name in names if not name.startswith('.')]
                    if any((Path(directory) / name).is_symlink() for name in dirs):
                        raise BundleError('UNSAFE_BUNDLE_PATH')
                    for name in names:
                        candidates.append(Path(directory) / name)
                        if len(candidates) > MAX_FILES: raise BundleError('BUNDLE_TOO_MANY_FILES')
            for item in candidates:
                if not include_hidden and any(part.startswith('.') for part in item.relative_to(base).parts): continue
                if any(p.is_symlink() for p in (item, *item.parents)):
                    raise BundleError('UNSAFE_BUNDLE_PATH')
                resolved = item.resolve(strict=True)
                if not any(resolved.is_relative_to(root) for root in roots): raise BundleError('UNSAFE_BUNDLE_PATH')
                boundary = max((root for root in roots if resolved.is_relative_to(root)), key=lambda root: len(root.parts))
                if not include_hidden and any(part.startswith('.') for part in resolved.relative_to(boundary).parts): continue
                if not stat.S_ISREG(item.lstat().st_mode): raise BundleError('UNSAFE_BUNDLE_PATH')
                found[str(resolved)] = resolved
                if len(found) > MAX_FILES: raise BundleError('BUNDLE_TOO_MANY_FILES')
    if not found: raise BundleError('BUNDLE_MISSING_FILES')
    common = Path(os.path.commonpath([str(p) for p in bases])).resolve()
    named = sorted((_name(path.relative_to(common).as_posix()), path) for path in found.values())
    if len({name.casefold() for name, _ in named}) != len(named): raise BundleError('UNSAFE_BUNDLE_PATH')
    return named


def pack(patterns, destination, *, roots, max_bytes, receipt=None, receipt_format='bytes', include_hidden=False):
    destination = _destination(destination); _budget(max_bytes)
    part = destination.with_name(destination.name + '.part-' + secrets.token_hex(12))
    created = False
    try:
        paths = _source_paths(patterns, roots, include_hidden)
        files, total = [], 0
        descriptor = os.open(part, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600); created = True
        with os.fdopen(descriptor, 'wb') as output, zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_STORED, allowZip64=False) as archive:
            for name, path in paths:
                source, before = _regular(path)
                with source:
                    if total + before.st_size + 1024 + len(name.encode('utf8')) > max_bytes:
                        raise BundleError('BUNDLE_TOO_LARGE')
                    header = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0)); header.create_system = 3
                    header.external_attr = 0o100644 << 16; header.file_size = before.st_size
                    digest, size = hashlib.sha256(), 0
                    with archive.open(header, 'w') as target:
                        while block := source.read(min(1024**2, before.st_size - size + 1)):
                            size += len(block)
                            if size > before.st_size: raise BundleError('BUNDLE_SOURCE_CHANGED')
                            target.write(block); digest.update(block)
                    after = os.fstat(source.fileno())
                    if size != before.st_size or (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
                        raise BundleError('BUNDLE_SOURCE_CHANGED')
                    files.append({'path': name, 'size': size, 'sha256': digest.hexdigest()}); total += size
                if output.tell() > max_bytes: raise BundleError('BUNDLE_TOO_LARGE')
        source, _ = _regular(part)
        with source: digest, size = _hash(source, max_bytes)
        by_name = dict(paths)
        def load(name):
            source, _ = _regular(by_name[name])
            with source: raw = source.read(1024**2 + 1)
            if hashlib.sha256(raw).hexdigest() != next(x['sha256'] for x in files if x['path'] == name):
                raise BundleError('BUNDLE_SOURCE_CHANGED')
            return raw
        canonical_sha = _receipt(files, receipt, receipt_format, load)
        descriptor = os.open(part, os.O_RDONLY)
        try: os.fsync(descriptor)
        finally: os.close(descriptor)
        os.link(part, destination)
        return {'size': size, 'sha256': digest, 'canonical_receipt_sha256': canonical_sha, 'file_count': len(files)}
    except BundleError: raise
    except Exception: raise BundleError('BUNDLE_PACK_FAILED') from None
    finally:
        if created: part.unlink(missing_ok=True)


def _directory_bound(source, size):
    # Check the small EOCD before ZipFile allocates objects for all entries.
    source.seek(max(0, size - 65557)); tail = source.read(65557)
    offset = tail.rfind(b'PK\x05\x06')
    if offset < 0 or len(tail) - offset < 22: raise BundleError('INVALID_BUNDLE_ARCHIVE')
    absolute_offset = size - len(tail) + offset
    if absolute_offset >= 20:
        source.seek(absolute_offset - 20)
        if source.read(4) == b'PK\x06\x07': raise BundleError('INVALID_BUNDLE_ARCHIVE')
    signature, disk, central_disk, count_disk, count, metadata_bytes, central_offset, comment = struct.unpack('<4s4H2LH', tail[offset:offset + 22])
    if (disk or central_disk or count_disk != count or not 1 <= count <= MAX_FILES
            or metadata_bytes > MAX_METADATA or central_offset + metadata_bytes > size
            or offset + 22 + comment != len(tail)):
        raise BundleError('INVALID_BUNDLE_ARCHIVE')
    source.seek(0)


def unpack(archive, destination, *, expected_sha256, canonical_sha256, max_bytes, receipt=None, receipt_format='bytes'):
    archive = Path(archive); destination = _destination(destination) if destination is not None else None; _budget(max_bytes)
    if not all(isinstance(v, str) and re.fullmatch('[a-f0-9]{64}', v) for v in (expected_sha256, canonical_sha256)):
        raise BundleError('INVALID_BUNDLE_DIGEST')
    created, inode = False, None
    try:
        source, info = _regular(archive)
        with source:
            if info.st_size > max_bytes: raise BundleError('BUNDLE_TOO_LARGE')
            actual, size = _hash(source, max_bytes)
            if actual != expected_sha256: raise BundleError('BUNDLE_INTEGRITY_FAILED')
            _directory_bound(source, size)
            with zipfile.ZipFile(source) as zipped:
                members = zipped.infolist(); names = [_name(x.filename) for x in members]
                if (len(members) > MAX_FILES or len(set(n.casefold() for n in names)) != len(names)
                        or sum(x.file_size for x in members) > max_bytes
                        or any(x.flag_bits & 1 or x.compress_type != zipfile.ZIP_STORED or not stat.S_ISREG(x.external_attr >> 16) for x in members)):
                    raise BundleError('INVALID_BUNDLE_ARCHIVE')
                files = []
                for member in sorted(members, key=lambda x: x.filename):
                    with zipped.open(member) as item: digest, count = _hash(item, member.file_size)
                    if count != member.file_size: raise BundleError('BUNDLE_INTEGRITY_FAILED')
                    files.append({'path': member.filename, 'size': count, 'sha256': digest})
                value = _receipt(files, receipt, receipt_format, lambda name: zipped.read(name))
                if value != canonical_sha256: raise BundleError('BUNDLE_CANONICAL_RECEIPT_MISMATCH')
                if destination is None: return {'verified': True, 'file_count': len(files)}
                # The entire archive and receipt are verified before claiming
                # a new directory. mkdir refuses even a concurrent destination.
                destination.mkdir(mode=0o700); created = True; inode = destination.stat().st_ino
                for member in members:
                    target = destination.joinpath(*PurePosixPath(member.filename).parts)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, 'O_NOFOLLOW', 0), 0o600)
                    with os.fdopen(fd, 'wb') as output, zipped.open(member) as item:
                        digest, count = hashlib.sha256(), 0
                        while block := item.read(min(1024**2, member.file_size - count + 1)):
                            count += len(block)
                            if count > member.file_size: raise BundleError('BUNDLE_TOO_LARGE')
                            output.write(block); digest.update(block)
                        output.flush(); os.fsync(output.fileno())
                    expected = next(x for x in files if x['path'] == member.filename)
                    if count != expected['size'] or digest.hexdigest() != expected['sha256']:
                        raise BundleError('BUNDLE_INTEGRITY_FAILED')
        return {'verified': True, 'file_count': len(files)}
    except BundleError: raise
    except Exception: raise BundleError('BUNDLE_UNPACK_FAILED') from None
    finally:
        import sys
        if created and sys.exc_info()[0] is not None and destination.is_dir() and not destination.is_symlink() and destination.stat().st_ino == inode:
            shutil.rmtree(destination)
