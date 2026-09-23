import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defaultClientConditions, defineConfig } from 'vite'
import { changelogDataPlugin } from './vite-plugins/changelog-data'
import { llmsTxtPlugin } from './vite-plugins/llms-txt'

const docsRoot = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(docsRoot, '../..')

export default defineConfig({
  resolve: {
    // Resolve the workspace @atom63/* packages to source so docs track edits live.
    conditions: ['@atom63/source', ...defaultClientConditions],
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    TanStackRouterVite({
      quoteStyle: 'single',
      autoCodeSplitting: false,
    }),
    mdx({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            defaultLang: 'tsx',
            keepBackground: false,
            theme: { dark: 'github-dark-dimmed', light: 'github-light' },
          },
        ],
      ],
    }),
    react(),
    tailwindcss(),
    changelogDataPlugin(workspaceRoot),
    llmsTxtPlugin(docsRoot),
  ],
  server: {
    port: 6200,
  },
})
