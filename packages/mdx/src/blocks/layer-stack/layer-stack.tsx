import type { ReactNode } from 'react'
import { FramedBlock, FramedBlockHeader, MdxFramePanel } from '../../foundations/frame/framed-block'

export type LayerStackItem = {
  constraint?: ReactNode
  description?: ReactNode
  label: ReactNode
  metaphor?: ReactNode
  title: ReactNode
}

export type LayerStackLabels = {
  metaphor: ReactNode
  description: ReactNode
  constraint: ReactNode
}

const defaultLayerStackLabels: LayerStackLabels = {
  metaphor: 'Metaphor',
  description: 'System role',
  constraint: 'AI constraint',
}

export type LayerStackProps = {
  className?: string
  description?: ReactNode
  labels?: Partial<LayerStackLabels>
  layers: LayerStackItem[]
  title?: ReactNode
}

export function LayerStack({ className, description, labels, layers, title }: LayerStackProps) {
  const resolvedLabels = { ...defaultLayerStackLabels, ...labels }
  return (
    <FramedBlock className={className}>
      <FramedBlockHeader
        description={description}
        descriptionClassName="mt-2 max-w-prose leading-relaxed text-pretty"
        title={title}
        titleClassName="mdx-layer-title text-lg leading-tight text-wrap"
      />
      {layers.map((layer, index) => (
        <MdxFramePanel
          className="mdx-layer-row grid min-w-0 gap-4 px-4 py-4 transition-colors sm:px-5 md:grid-cols-[10rem_1fr] md:gap-5"
          key={index}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="mdx-layer-badge flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="mdx-layer-label font-mono text-xs tracking-wider uppercase">
                {layer.label}
              </p>
              <h3 className="mdx-layer-title mt-1 text-sm leading-snug font-semibold text-wrap">
                {layer.title}
              </h3>
            </div>
          </div>
          <div className="grid min-w-0 gap-4 text-sm leading-relaxed sm:grid-cols-3">
            {layer.metaphor ? (
              <div className="min-w-0">
                <p className="mdx-layer-term text-xs font-medium">{resolvedLabels.metaphor}</p>
                <div className="mdx-layer-def mt-1.5 text-pretty">{layer.metaphor}</div>
              </div>
            ) : null}
            {layer.description ? (
              <div className="min-w-0">
                <p className="mdx-layer-term text-xs font-medium">{resolvedLabels.description}</p>
                <div className="mdx-layer-def mt-1.5 text-pretty">{layer.description}</div>
              </div>
            ) : null}
            {layer.constraint ? (
              <div className="min-w-0">
                <p className="mdx-layer-term text-xs font-medium">{resolvedLabels.constraint}</p>
                <div className="mdx-layer-def mt-1.5 text-pretty">{layer.constraint}</div>
              </div>
            ) : null}
          </div>
        </MdxFramePanel>
      ))}
    </FramedBlock>
  )
}
