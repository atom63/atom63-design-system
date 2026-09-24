import { MdxPageSkeleton, PageTableOfContents } from '@atom63/mdx/blocks'
import { Container, Page, ReaderLayout, Section } from '@atom63/ui-react/layout'
import { Suspense } from 'react'
import { componentSlugFromDocSlug } from '../lib/component-catalog'
import { DEFAULT_DOC_SLUG, pathForDoc, resolveDocTarget } from '../lib/doc-routing'
import { DOC_AREA_DEFAULTS, getDocNavigation, isAuthoredPageSlug, PAGES } from '../lib/doc-pages'
import { useHashScroll } from '../lib/use-hash-scroll'
import { MDXContentProvider } from '../mdx/mdx-provider'
import {
  DOC_TOC_HEADING_SELECTOR,
  DocBreadcrumb,
  DocPageActions,
  DocPageFooterNav,
} from './doc-page-chrome'
import { ComponentReferenceUtilities } from './component-reference-utilities'

type DocsPageProps = {
  area?: string
  slug?: string
}

export function DocsPage({ area, slug }: DocsPageProps) {
  const activeTarget = resolveDocTarget(area, slug)
  const MdxPage = PAGES[activeTarget.slug]
  const navigation = getDocNavigation(activeTarget.area, activeTarget.slug)
  const isAreaLanding =
    activeTarget.slug === DEFAULT_DOC_SLUG ||
    DOC_AREA_DEFAULTS[activeTarget.area] === activeTarget.slug
  const isAuthoredPage = isAuthoredPageSlug(activeTarget.slug)
  const authoredComponentSlug =
    activeTarget.area === 'components' && isAuthoredPage
      ? componentSlugFromDocSlug(activeTarget.slug)
      : null
  const pagePath = pathForDoc(activeTarget.area, activeTarget.slug)
  const markdownPath = pagePath === '/' ? '/index.md' : `${pagePath}.md`

  useHashScroll(activeTarget.slug)

  return (
    <Page noPadding>
      <Container maxWidth="widest" padding="none">
        <Section
          className="docs-document-section"
          gap={false}
          removeTopSpacing={false}
          spacing="tight"
        >
          <ReaderLayout
            aside={<PageTableOfContents headingSelector={DOC_TOC_HEADING_SELECTOR} />}
            asideClassName="docs-page-aside p-0"
            className="docs-reader-layout"
            contentClassName="docs-reader-column !space-y-0"
          >
            <div className="docs-reader-surface">
              <DocPageActions markdownPath={markdownPath} slug={activeTarget.slug} />
              <div className="docs-page-flow space-y-8">
                <div className="docs-page-meta">
                  {isAreaLanding ? null : (
                    <DocBreadcrumb area={activeTarget.area} navigation={navigation} />
                  )}
                </div>
                <MDXContentProvider>
                  <Suspense fallback={<MdxPageSkeleton showRail={false} variant="docs" />}>
                    <MdxPage />
                    {authoredComponentSlug ? (
                      <ComponentReferenceUtilities componentSlug={authoredComponentSlug} />
                    ) : null}
                  </Suspense>
                </MDXContentProvider>
                <DocPageFooterNav navigation={navigation} />
              </div>
            </div>
          </ReaderLayout>
        </Section>
      </Container>
    </Page>
  )
}
