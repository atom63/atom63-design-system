import mdx from '@mdx-js/rollup'
import path from 'node:path'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

export type WorkspaceAppPaths = {
  appRoot: string
  appServicesPackageRoot: string
  brandPackageRoot: string
  devPackageRoot: string
  dialkitPackageRoot: string
  iconsPackageRoot: string
  mdxPackageRoot: string
  portfolioContentPackageRoot: string
  resumePackageRoot: string
  slidesPackageRoot: string
  timelinePackageRoot: string
  workspaceRoot: string
}

type EnvironmentSource = Record<string, string | undefined>

/**
 * Merge environment sources from lowest to highest priority.
 *
 * Empty values are skipped so a generated app-local `.env.local` does not
 * accidentally mask a configured workspace-level fallback.
 */
export function mergeNonEmptyEnv(...sources: EnvironmentSource[]): Record<string, string> {
  const merged: Record<string, string> = {}

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (value !== undefined && value.trim() !== '') {
        merged[key] = value
      }
    }
  }

  return merged
}

export function createWorkspaceAppPaths(appRoot: string): WorkspaceAppPaths {
  const workspaceRoot = path.resolve(appRoot, '../..')

  return {
    appRoot,
    appServicesPackageRoot: path.resolve(workspaceRoot, 'packages/app-services'),
    brandPackageRoot: path.resolve(workspaceRoot, 'packages/brand'),
    devPackageRoot: path.resolve(workspaceRoot, 'packages/dev'),
    dialkitPackageRoot: path.resolve(workspaceRoot, 'packages/dialkit'),
    iconsPackageRoot: path.resolve(workspaceRoot, 'packages/icons'),
    mdxPackageRoot: path.resolve(workspaceRoot, 'packages/mdx'),
    portfolioContentPackageRoot: path.resolve(workspaceRoot, 'packages/portfolio-content'),
    resumePackageRoot: path.resolve(workspaceRoot, 'packages/resume'),
    slidesPackageRoot: path.resolve(workspaceRoot, 'packages/slides'),
    timelinePackageRoot: path.resolve(workspaceRoot, 'packages/timeline'),
    workspaceRoot,
  }
}

export function createWorkspaceAliases(paths: WorkspaceAppPaths) {
  const appServicesSrc = path.join(paths.appServicesPackageRoot, 'src')
  const brandSrc = path.join(paths.brandPackageRoot, 'src')
  const devSrc = path.join(paths.devPackageRoot, 'src')
  const dialkitSrc = path.join(paths.dialkitPackageRoot, 'src')
  const iconsSrc = path.join(paths.iconsPackageRoot, 'src')
  const mdxSrc = path.join(paths.mdxPackageRoot, 'src')
  const portfolioContentSrc = path.join(paths.portfolioContentPackageRoot, 'src')
  const resumeSrc = path.join(paths.resumePackageRoot, 'src')
  const slidesSrc = path.join(paths.slidesPackageRoot, 'src')
  const timelineSrc = path.join(paths.timelinePackageRoot, 'src')
  const uiFoundationSrc = path.join(paths.workspaceRoot, 'packages/ui-foundation/src')
  const uiReactSrc = path.join(paths.workspaceRoot, 'packages/ui-react/src')

  return {
    '@atom63/app-services/notion': path.join(appServicesSrc, 'notion/index.ts'),
    '@atom63/app-services/shuffle': path.join(appServicesSrc, 'shuffle.ts'),
    '@atom63/app-services': path.join(appServicesSrc, 'index.ts'),
    '@atom63/brand/seo': path.join(brandSrc, 'seo/index.ts'),
    '@atom63/brand': path.join(brandSrc, 'index.ts'),
    '@atom63/dev': path.join(devSrc, 'index.ts'),
    '@atom63/dialkit/styles.css': path.join(dialkitSrc, 'styles/theme.css'),
    '@atom63/dialkit/store': path.join(dialkitSrc, 'store/DialStore.ts'),
    '@atom63/dialkit/timeline': path.join(dialkitSrc, 'timeline/index.ts'),
    '@atom63/dialkit': path.join(dialkitSrc, 'index.ts'),
    '@atom63/icons/animated': path.join(iconsSrc, 'animated/index.ts'),
    '@atom63/icons/behance': path.join(iconsSrc, 'behance/index.ts'),
    '@atom63/icons/companies': path.join(iconsSrc, 'companies/index.ts'),
    '@atom63/icons/icons': path.join(iconsSrc, 'icons/index.tsx'),
    '@atom63/icons': path.join(iconsSrc, 'index.ts'),
    '@atom63/mdx/article': path.join(mdxSrc, 'article/index.ts'),
    '@atom63/mdx/blocks/credits-block': path.join(mdxSrc, 'blocks/credits-block-entry.ts'),
    '@atom63/mdx/blocks/media-caption': path.join(mdxSrc, 'blocks/media-caption-entry.ts'),
    '@atom63/mdx/blocks': path.join(mdxSrc, 'blocks/index.ts'),
    '@atom63/mdx/craft-demos': path.join(mdxSrc, 'craft-demos/index.ts'),
    '@atom63/mdx/editor': path.join(mdxSrc, 'editor/index.ts'),
    '@atom63/mdx/lightbox': path.join(mdxSrc, 'lightbox/index.ts'),
    '@atom63/mdx/primitives': path.join(mdxSrc, 'primitives/index.ts'),
    '@atom63/mdx/styles/a63.css': path.join(mdxSrc, 'styles/a63.css'),
    '@atom63/mdx/styles/consumer.css': path.join(mdxSrc, 'styles/consumer.css'),
    '@atom63/mdx/styles/index.css': path.join(mdxSrc, 'styles/index.css'),
    '@atom63/mdx/styles/mdx-blocks.css': path.join(mdxSrc, 'styles/mdx-blocks.css'),
    '@atom63/mdx/styles/shadcn.css': path.join(mdxSrc, 'styles/shadcn.css'),
    '@atom63/mdx': path.join(mdxSrc, 'index.ts'),
    // More-specific portfolio-content subpaths before the package root.
    '@atom63/portfolio-content/knowledge': path.join(portfolioContentSrc, 'knowledge/index.ts'),
    '@atom63/portfolio-content/react': path.join(portfolioContentSrc, 'react/index.tsx'),
    '@atom63/portfolio-content': path.join(portfolioContentSrc, 'index.ts'),
    '@atom63/resume/styles': path.join(resumeSrc, 'styles/styles.css'),
    '@atom63/resume/tokens': path.join(resumeSrc, 'styles/tokens.css'),
    '@atom63/resume/editor': path.join(resumeSrc, 'editor/index.ts'),
    '@atom63/resume/vite': path.join(resumeSrc, 'vite/index.ts'),
    '@atom63/resume': path.join(resumeSrc, 'index.ts'),
    '@atom63/slides/editor/styles': path.join(slidesSrc, 'editor/styles.css'),
    '@atom63/slides/editor': path.join(slidesSrc, 'editor/index.ts'),
    '@atom63/slides/theme-defaults': path.join(slidesSrc, 'styles/theme-defaults.css'),
    '@atom63/slides/theme-fonts': path.join(slidesSrc, 'styles/theme-fonts.css'),
    '@atom63/slides/themes/dark': path.join(slidesSrc, 'styles/themes/dark.css'),
    '@atom63/slides/themes/terminal': path.join(slidesSrc, 'styles/themes/terminal.css'),
    '@atom63/slides/themes/editorial': path.join(slidesSrc, 'styles/themes/editorial.css'),
    '@atom63/slides/themes/neon': path.join(slidesSrc, 'styles/themes/neon.css'),
    '@atom63/slides/themes/bold': path.join(slidesSrc, 'styles/themes/bold.css'),
    '@atom63/slides/themes': path.join(slidesSrc, 'styles/themes.css'),
    '@atom63/slides/styles': path.join(slidesSrc, 'styles/slides.css'),
    '@atom63/slides/vite': path.join(slidesSrc, 'vite/index.ts'),
    '@atom63/slides': path.join(slidesSrc, 'index.ts'),
    '@atom63/timeline': path.join(timelineSrc, 'index.ts'),
    '@atom63/ui-foundation': path.join(uiFoundationSrc, 'index.ts'),
    // ui-react: source aliases so layout/theme/media HMR without rebuilding dist.
    // The aggregate CSS subpaths need explicit aliases too — the bare
    // '@atom63/ui-react' entry below is a PREFIX alias, so without these it would
    // rewrite '@atom63/ui-react/recipes.css' to 'src/index.ts/recipes.css'.
    '@atom63/ui-react/styles.css': path.join(uiReactSrc, 'styles/index.css'),
    '@atom63/ui-react/reset.css': path.join(uiReactSrc, 'styles/reset.css'),
    '@atom63/ui-react/recipes.css': path.join(uiReactSrc, 'styles/recipes.css'),
    '@atom63/ui-react/layout': path.join(uiReactSrc, 'layout/index.ts'),
    '@atom63/ui-react/theme': path.join(uiReactSrc, 'theme/index.ts'),
    '@atom63/ui-react/media/lightbox': path.join(uiReactSrc, 'media/media-lightbox/parts/index.ts'),
    '@atom63/ui-react/media': path.join(uiReactSrc, 'media/index.ts'),
    '@atom63/ui-react': path.join(uiReactSrc, 'index.ts'),
  }
}

export const workspaceOptimizeDepsExclude = [
  '@atom63/app-services',
  '@atom63/app-services/notion',
  '@atom63/app-services/shuffle',
  '@atom63/brand',
  '@atom63/brand/seo',
  '@atom63/dev',
  '@atom63/dialkit',
  '@atom63/dialkit/store',
  '@atom63/dialkit/styles.css',
  '@atom63/dialkit/timeline',
  '@atom63/icons',
  '@atom63/icons/animated',
  '@atom63/icons/behance',
  '@atom63/icons/companies',
  '@atom63/icons/icons',
  '@atom63/mdx',
  '@atom63/mdx/article',
  '@atom63/mdx/blocks/credits-block',
  '@atom63/mdx/blocks/media-caption',
  '@atom63/mdx/blocks',
  '@atom63/mdx/craft-demos',
  '@atom63/mdx/editor',
  '@atom63/mdx/lightbox',
  '@atom63/mdx/primitives',
  '@atom63/portfolio-content',
  '@atom63/portfolio-content/knowledge',
  '@atom63/portfolio-content/react',
  '@atom63/resume',
  '@atom63/resume/editor',
  '@atom63/resume/styles',
  '@atom63/resume/tokens',
  '@atom63/resume/vite',
  '@atom63/slides',
  '@atom63/slides/editor',
  '@atom63/slides/editor/styles',
  '@atom63/slides/theme-defaults',
  '@atom63/slides/theme-fonts',
  '@atom63/slides/themes/dark',
  '@atom63/slides/themes/terminal',
  '@atom63/slides/themes/editorial',
  '@atom63/slides/themes/neon',
  '@atom63/slides/themes/bold',
  '@atom63/slides/themes',
  '@atom63/slides/styles',
  '@atom63/slides/vite',
  '@atom63/timeline',
  // React-first design system (CSS-subpath exports must skip esbuild dep-optimization).
  '@atom63/ui-foundation',
  '@atom63/ui-react',
  '@atom63/ui-react/layout',
  '@atom63/ui-react/theme',
  '@atom63/ui-react/media',
  '@atom63/ui-react/media/lightbox',
  '@atom63/ui-react/styles.css',
  '@atom63/ui-react/reset.css',
  '@atom63/ui-react/recipes/button.css',
  '@atom63/ui-react/recipes/input.css',
  '@atom63/ui-react/recipes/kbd.css',
  '@atom63/ui-react/recipes/segmented-control.css',
  '@atom63/ui-react/recipes/select.css',
  '@atom63/ui-react/recipes/switch.css',
  '@atom63/ui-react/recipes/toggle.css',
  '@atom63/ui-react/recipes/toggle-group.css',
  '@atom63/styles',
  '@atom63/styles/contracts',
  '@atom63/styles/tokens/space',
  '@atom63/styles/tokens/radius',
  '@atom63/styles/tokens/motion',
  '@atom63/styles/tokens/semantics',
  '@atom63/styles/tokens/brand',
  '@atom63/styles/tokens/surface',
] as const

export function createWorkspaceFsAllow(paths: WorkspaceAppPaths) {
  return [
    paths.appRoot,
    paths.appServicesPackageRoot,
    paths.brandPackageRoot,
    paths.dialkitPackageRoot,
    paths.iconsPackageRoot,
    paths.mdxPackageRoot,
    paths.portfolioContentPackageRoot,
    paths.resumePackageRoot,
    paths.slidesPackageRoot,
    paths.timelinePackageRoot,
    paths.devPackageRoot,
    paths.workspaceRoot,
  ]
}

export function createMdxPlugin() {
  return mdx({
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
  })
}
