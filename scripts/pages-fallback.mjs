import { copyFileSync } from 'node:fs'
// One learning application, including fallback for old bookmarks.
copyFileSync(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url))
