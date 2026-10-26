#!/usr/bin/env bash
# One foreground step owns one slot; scripts keep their original bash semantics.
set -euo pipefail
kind=${CI_RESOURCE_CLASS:-heavy}
[[ $kind == heavy || $kind == light ]] || { echo CI_RESOURCE_CLASS_INVALID >&2; exit 64; }
[[ $# -eq 1 && -f $1 ]] || { echo CI_STEP_FILE_INVALID >&2; exit 64; }
case ${RUNNER_ENVIRONMENT:-} in
  self-hosted)
    [[ $(id -u) == 995 && ${GITHUB_REPOSITORY:-} == gcake119/agent-system-design-learning-map && ${RUNNER_NAME:-} == mint-agent-system-design-learning-map ]] || { echo CI_MINT_IDENTITY >&2; exit 1; }
    exec /usr/local/bin/ci-resource-slot --class "$kind" --timeout 900 -- /usr/bin/bash --noprofile --norc -e -o pipefail "$1"
    ;;
  github-hosted) exec /usr/bin/bash --noprofile --norc -e -o pipefail "$1" ;;
  *) echo CI_RUNNER_ENVIRONMENT_INVALID >&2; exit 1 ;;
esac
