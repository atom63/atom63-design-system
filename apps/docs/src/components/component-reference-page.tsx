import { mdxComponents } from '@atom63/mdx'
import { DocExample } from '@atom63/mdx/blocks'
import {
  Component,
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import {
  componentCatalogItems,
  componentLabel,
  type ComponentCatalogItem,
} from '../lib/component-catalog'
import { getComponentDoc } from '../lib/component-docs'
import { ComponentReferenceUtilities } from './component-reference-utilities'

type StoryArgs = Record<string, unknown>

type StoryDecorator = (Story: ComponentType, context: { args: StoryArgs }) => ReactNode

type StoryDefinition = {
  args?: StoryArgs
  decorators?: readonly StoryDecorator[]
  render?: (args: StoryArgs) => ReactNode
}

type StoryMeta = {
  args?: StoryArgs
  component?: ComponentType<StoryArgs>
  decorators?: readonly StoryDecorator[]
}

type StoryModule = Record<string, unknown> & {
  default?: StoryMeta
}

type GeneratedStoryPreviewProps = {
  previewProfile: ComponentCatalogItem['previewProfile']
}

const componentStoryModules = import.meta.glob<StoryModule>(
  '../../../../packages/ui-react/src/components/*/*.stories.tsx'
)
const componentStorySources = import.meta.glob<string>(
  '../../../../packages/ui-react/src/components/*/*.stories.tsx',
  {
    import: 'default',
    query: '?raw',
  }
)

function storySlugFromPath(path: string): string | null {
  const match = /\/components\/([^/]+)\/([^/]+)\.stories\.tsx$/.exec(path)
  if (!match || match[1] !== match[2]) {
    return null
  }

  return match[1] ?? null
}

const storyPreviews = Object.fromEntries(
  Object.entries(componentStoryModules).flatMap(([path, loadModule]) => {
    const slug = storySlugFromPath(path)
    if (!slug) {
      return []
    }
    const item = componentCatalogItems.find(candidate => candidate.slug === slug)
    if (!item) {
      return []
    }

    const loadSource = componentStorySources[path]
    if (!loadSource) {
      return []
    }

    const Preview = lazy(async () => {
      const [storyModule, storySource] = await Promise.all([loadModule(), loadSource()])
      return {
        default: function RepresentativeStory({ previewProfile }: GeneratedStoryPreviewProps) {
          return (
            <GeneratedComponentExample
              previewProfile={previewProfile}
              storyExport={item.storyExport}
              storyModule={storyModule}
              storySource={storySource}
            />
          )
        },
      }
    })

    return [[slug, Preview]]
  })
) as Record<string, ComponentType<GeneratedStoryPreviewProps>>

function isStoryDefinition(value: unknown): value is StoryDefinition {
  return Boolean(value && typeof value === 'object')
}

function representativeStory(
  storyModule: StoryModule,
  storyExport: string
): StoryDefinition | null {
  const story = storyModule[storyExport]
  return isStoryDefinition(story) ? story : null
}

function StoryModulePreview({
  storyExport,
  storyModule,
}: {
  storyExport: string
  storyModule: StoryModule
}) {
  const meta = storyModule.default ?? {}
  const story = representativeStory(storyModule, storyExport)
  if (!story) {
    return <PreviewUnavailable reason="The selected representative story is unavailable." />
  }

  const args = { ...meta.args, ...story.args }
  const BaseStory: ComponentType = () => {
    if (story.render) {
      return <>{story.render(args)}</>
    }
    if (meta.component) {
      return createElement(meta.component, args)
    }
    return <PreviewUnavailable reason="The representative story has no render function." />
  }

  const decorators = [...(meta.decorators ?? []), ...(story.decorators ?? [])]
  const DecoratedStory = decorators.reduceRight<ComponentType>(
    (CurrentStory, decorate) =>
      function StoryWithDecorator() {
        return <>{decorate(CurrentStory, { args })}</>
      },
    BaseStory
  )

  return <DecoratedStory />
}

function PreviewUnavailable({ reason }: { reason: string }) {
  return (
    <p className="m-0 text-sm text-muted-foreground" role="status">
      {reason}
    </p>
  )
}

type PreviewErrorBoundaryProps = {
  children: ReactNode
  resetKey: string
}

type PreviewErrorBoundaryState = {
  error: Error | null
}

class PreviewErrorBoundary extends Component<PreviewErrorBoundaryProps, PreviewErrorBoundaryState> {
  state: PreviewErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): PreviewErrorBoundaryState {
    return { error }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The visible error state keeps a broken package example from taking down the docs route.
  }

  componentDidUpdate(previousProps: PreviewErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <PreviewUnavailable reason="This representative preview could not be rendered. The usage and API reference remain available below." />
      )
    }

    return this.props.children
  }
}

const previewProfileClassNames: Record<ComponentCatalogItem['previewProfile'], string> = {
  canvas: 'min-h-60 max-h-[26rem] items-start',
  compact: 'min-h-28 max-h-60 items-center',
  standard: 'min-h-40 max-h-80 items-center',
}

function GeneratedComponentExample({
  previewProfile,
  storyExport,
  storyModule,
  storySource,
}: {
  previewProfile: ComponentCatalogItem['previewProfile']
  storyExport: string
  storyModule: StoryModule
  storySource: string
}) {
  return (
    <DocExample className="my-6" code={storySource.trim()} codeLabel="Story source" wide>
      <div
        className="relative isolate w-full min-w-0 [transform:translateZ(0)] overflow-auto [contain:layout_paint]"
        data-preview-profile={previewProfile}
      >
        <div
          className={`flex w-full min-w-full justify-center ${previewProfileClassNames[previewProfile]}`}
          data-component-preview-stage=""
        >
          <div className="flex w-full max-w-full flex-wrap [&>*]:mx-auto">
            <StoryModulePreview storyExport={storyExport} storyModule={storyModule} />
          </div>
        </div>
      </div>
    </DocExample>
  )
}

export function ComponentPreview({
  previewProfile,
  slug,
}: {
  previewProfile: ComponentCatalogItem['previewProfile']
  slug: string
}) {
  const StoryPreview = storyPreviews[slug]

  return (
    <PreviewErrorBoundary resetKey={slug}>
      {StoryPreview ? (
        <Suspense
          fallback={
            <div
              aria-label="Loading representative preview"
              className="my-6 flex min-h-44 w-full items-center justify-center rounded-xl border border-border/80 bg-card/40"
              role="status"
            >
              <span className="h-8 w-32 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            </div>
          }
        >
          <StoryPreview previewProfile={previewProfile} />
        </Suspense>
      ) : (
        <PreviewUnavailable reason="No co-located representative story is available." />
      )}
    </PreviewErrorBoundary>
  )
}

function StatusBadge({ status }: { status: ComponentCatalogItem['status'] }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-border bg-muted/50 px-2.5 text-xs font-medium text-muted-foreground capitalize">
      {status}
    </span>
  )
}

export function ComponentReferencePage({ componentSlug }: { componentSlug: string }) {
  const doc = getComponentDoc(componentSlug)
  const H1 = mdxComponents.h1
  const H2 = mdxComponents.h2
  const P = mdxComponents.p
  const Ul = mdxComponents.ul
  const Li = mdxComponents.li

  if (!doc) {
    return <PreviewUnavailable reason={`Unknown component: ${componentSlug}`} />
  }

  return (
    <>
      <div className="not-prose mb-6 flex flex-wrap items-center gap-3">
        <H1 className="m-0 flex-1">{doc.label}</H1>
        {doc.item.status === 'preview' ? <StatusBadge status={doc.item.status} /> : null}
      </div>
      <P>{doc.summary}</P>

      <H2 id="preview">Preview</H2>
      <P>
        This representative example is loaded from the component story maintained with the package.
      </P>
      <ComponentPreview previewProfile={doc.item.previewProfile} slug={componentSlug} />

      <H2 id="guidance">Guidance</H2>
      <Ul>
        {doc.guidance.map(item => (
          <Li key={item}>{item}</Li>
        ))}
      </Ul>

      <ComponentReferenceUtilities componentSlug={componentSlug} />
    </>
  )
}

export function createComponentReferencePage(componentSlug: string): ComponentType {
  function GeneratedComponentReferencePage() {
    return <ComponentReferencePage componentSlug={componentSlug} />
  }

  GeneratedComponentReferencePage.displayName = `${componentLabel(componentSlug)}ReferencePage`
  return GeneratedComponentReferencePage
}
