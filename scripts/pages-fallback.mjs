import { copyFileSync } from 'node:fs'
// Learning uses hash routes. Deep /slides/:page requests need the Slidev shell.
copyFileSync(new URL('../dist/slides/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url))
