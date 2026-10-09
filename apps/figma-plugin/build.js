/**
 * Cipher - Figma Plugin
 * Author: You Zhang (ATOM63)
 * Build configuration for the Figma plugin
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDev = process.argv.includes('--watch')

// CSS Modules plugin
const cssModulesPlugin = {
  name: 'css-modules',
  setup(build) {
    // Helper function for CSS Modules processing
    const hashCode = str => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash &= hash
      }
      return Math.abs(hash).toString(36).substring(0, 6)
    }

    const processCssModule = (css, filePath) => {
      const hash = hashCode(filePath)

      // Extract class names and create mapping
      const classNames = {}
      const scopedCss = css.replace(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g, (_match, className) => {
        const scopedName = `${className}_${hash}`
        classNames[className] = scopedName
        return `.${scopedName}`
      })

      return {
        contents: `
          const style = document.createElement('style');
          style.textContent = ${JSON.stringify(scopedCss)};
          document.head.appendChild(style);
          export default ${JSON.stringify(classNames)};
        `,
        loader: 'js',
      }
    }

    // Handle .module.scss files
    build.onLoad({ filter: /\.module\.scss$/ }, async args => {
      const sass = await import('sass')
      const result = sass.compile(args.path)
      return processCssModule(result.css, args.path)
    })

    // Handle .module.css files
    build.onLoad({ filter: /\.module\.css$/ }, async args => {
      const fs = await import('node:fs/promises')
      const css = await fs.readFile(args.path, 'utf-8')
      return processCssModule(css, args.path)
    })
  },
}

/*
 * A `?raw` import is the file's text as one string literal. For JSON the text
 * is minified first, and the importer parses it when it needs it: code.js
 * holds the Atom63 models this way, so loading the plugin only scans two
 * strings instead of building their objects (R3).
 */
/** @type {import('esbuild').Plugin} */
const rawPlugin = {
  name: 'raw',
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, async args => {
      const result = await build.resolve(args.path.slice(0, -'?raw'.length), {
        kind: args.kind,
        resolveDir: args.resolveDir,
      })
      if (result.errors.length > 0) return { errors: result.errors }
      return { path: result.path, namespace: 'raw' }
    })
    build.onLoad({ filter: /.*/, namespace: 'raw' }, args => {
      const text = readFileSync(args.path, 'utf-8')
      return {
        contents: args.path.endsWith('.json') ? JSON.stringify(JSON.parse(text)) : text,
        loader: 'text',
        watchFiles: [args.path],
      }
    })
  },
}

// Ensure dist directory exists
const distDir = resolve(__dirname, 'dist')
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// Build the plugin code (runs in Figma's sandbox)
const codeContext = await esbuild.context({
  entryPoints: [resolve(__dirname, 'src/code.ts')],
  bundle: true,
  outfile: resolve(__dirname, 'dist/code.js'),
  platform: 'node',
  target: 'es2017',
  logLevel: 'info',
  minify: !isDev,
  // The sync engine comes from @atom63/figma's TypeScript sources, like the UI's packages.
  conditions: ['@atom63/source'],
  plugins: [rawPlugin],
})

// Build the UI (React app)
const uiContext = await esbuild.context({
  entryPoints: [resolve(__dirname, 'src/ui.tsx')],
  bundle: true,
  outfile: resolve(__dirname, 'dist/ui.js'),
  platform: 'browser',
  target: 'es2020',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  logLevel: 'info',
  minify: !isDev,
  jsx: 'automatic',
  format: 'iife',
  // Workspace packages resolve to their TypeScript sources, as in the docs and Storybook.
  conditions: ['@atom63/source'],
  plugins: [cssModulesPlugin],
})

// Build the UI SCSS separately
const cssPlugin = {
  name: 'scss',
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, async args => {
      const sass = await import('sass')
      const result = sass.compile(args.path)
      return {
        contents: result.css,
        loader: 'css',
      }
    })
  },
}

const cssContext = await esbuild.context({
  entryPoints: [resolve(__dirname, 'src/ui.scss')],
  bundle: true,
  outfile: resolve(__dirname, 'dist/ui.css'),
  logLevel: 'info',
  minify: !isDev,
  plugins: [cssPlugin],
})

// The Atom63 design system: tokens, component recipes and the shadcn bridge.
const atom63CssContext = await esbuild.context({
  entryPoints: [resolve(__dirname, 'src/atom63.css')],
  bundle: true,
  outfile: resolve(__dirname, 'dist/atom63.css'),
  logLevel: 'info',
  minify: !isDev,
  conditions: ['@atom63/source'],
})

// Generate the HTML file with INLINED JavaScript (Figma requires this)
function generateHTML() {
  // Read the compiled JavaScript
  const jsContent = readFileSync(resolve(__dirname, 'dist/ui.js'), 'utf-8')
  const cssContent = readFileSync(resolve(__dirname, 'dist/ui.css'), 'utf-8')
  const atom63CssContent = readFileSync(resolve(__dirname, 'dist/atom63.css'), 'utf-8')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cipher by Atom63</title>
  <style>
    ${atom63CssContent}
  </style>
  <style>
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    ${jsContent}
  </script>
</body>
</html>`

  writeFileSync(resolve(__dirname, 'dist/ui.html'), html)
}

if (isDev) {
  // Watch and rebuild
  await codeContext.watch()
  await uiContext.watch()
  await cssContext.watch()
  await atom63CssContext.watch()

  // Generate HTML once at start
  generateHTML()

  console.log('👀 Watching for changes...')
  console.log('💡 Reload the plugin in Figma after making changes')

  // Set up manual rebuild detection for HTML generation
  let lastBuildTime = Date.now()
  setInterval(() => {
    void (async () => {
      try {
        const uiJsPath = resolve(__dirname, 'dist/ui.js')
        const uiCssPath = resolve(__dirname, 'dist/ui.css')
        const atom63CssPath = resolve(__dirname, 'dist/atom63.css')
        const fs = await import('node:fs/promises')

        const [jsStats, cssStats, atom63CssStats] = await Promise.all([
          fs.stat(uiJsPath).catch(() => null),
          fs.stat(uiCssPath).catch(() => null),
          fs.stat(atom63CssPath).catch(() => null),
        ])

        const newestTime = Math.max(
          jsStats?.mtimeMs || 0,
          cssStats?.mtimeMs || 0,
          atom63CssStats?.mtimeMs || 0
        )

        if (newestTime > lastBuildTime) {
          lastBuildTime = newestTime
          generateHTML()
          console.log('✅ Rebuilt at', new Date().toLocaleTimeString())
        }
      } catch (_error) {
        // Ignore errors
      }
    })()
  }, 500)

  // Keep the process alive
  process.stdin.on('data', () => {})
} else {
  await Promise.all([
    codeContext.rebuild(),
    uiContext.rebuild(),
    cssContext.rebuild(),
    atom63CssContext.rebuild(),
  ])

  generateHTML()

  await Promise.all([
    codeContext.dispose(),
    uiContext.dispose(),
    cssContext.dispose(),
    atom63CssContext.dispose(),
  ])
}
