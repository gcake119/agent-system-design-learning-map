import { copyFileSync } from 'node:fs'
// GitHub Pages serves this SPA shell for direct slide URLs and refreshes.
copyFileSync(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url))
