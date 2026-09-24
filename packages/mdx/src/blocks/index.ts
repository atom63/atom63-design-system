export { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from '../lightbox/constants'
export { Accordion, type AccordionProps } from './accordion'
export { Callout, type CalloutProps } from './callout'
export { CodeBlock, type CodeBlockProps } from './code-block'
export { ColorSwatchItem, type ColorSwatchItemProps } from './color-swatch-item'
export { Compare, type CompareItemProps, type CompareProps } from './compare'
export {
  ComparisonPair,
  type ComparisonPairProps,
  type ComparisonSlotProps,
} from './comparison-pair'
export { CreditsBlock, type CreditEntry, type CreditsBlockProps } from './credits-block'
export {
  DemoConfigPanel,
  type DemoConfigPanelProps,
  DemoStage,
  type DemoStageProps,
} from './demo-stage'
export { DocExample, type DocExampleProps } from './doc-example'
export { DocExampleCode, type DocExampleCodeProps } from './doc-example-code'
export { ExampleContainer, type ExampleContainerProps } from '../example-container'
export { FigureBlock, type FigureBlockProps } from './figure-block'
export { ImageCompare, type ImageCompareImage, type ImageCompareProps } from './image-compare'
export { KeyIdea, type KeyIdeaProps } from './key-idea'
export {
  LayerStack,
  type LayerStackItem,
  type LayerStackLabels,
  type LayerStackProps,
} from './layer-stack'
export { MdxPageSkeleton, type MdxPageSkeletonProps } from './mdx-page-skeleton'
export { MediaCaption, type MediaCaptionProps } from './media-caption'
export {
  MediaPlaceholder,
  type MediaPlaceholderKind,
  type MediaPlaceholderProps,
} from './media-placeholder'
export {
  MermaidDiagram,
  defaultMermaidDiagramLabels,
  type MermaidDiagramLabels,
  type MermaidDiagramProps,
} from './mermaid-diagram'
export { PageMeta, type PageMetaProps } from './page-meta'
export { PageTableOfContents, type PageTableOfContentsProps } from './page-table-of-contents'
export { ResourceList, type ResourceItem, type ResourceListProps } from './resource-list'
export { ScrollStage, type ScrollStageProps, type ScrollStageStepProps } from './scroll-stage'
export { StatCard, type StatCardProps, type StatTrend } from './stat-card'
export { StatGrid, type StatGridProps } from './stat-grid'
export { Steps, type StepsProps, type StepsStepProps } from './steps'
export { Tabs, type TabsProps } from './tabs'
export { Timeline, type TimelineItemProps, type TimelineProps } from './timeline'
export { VideoBlock, type VideoBlockProps } from './video-block'

/** All portable MDX block component names (site media blocks are registered separately). */
export const portableBlockNames = [
  'Accordion',
  'Callout',
  'CodeBlock',
  'ColorSwatchItem',
  'Compare',
  'ComparisonPair',
  'CreditsBlock',
  'DemoStage',
  'ExampleContainer',
  'FigureBlock',
  'ImageCompare',
  'KeyIdea',
  'LayerStack',
  'MediaCaption',
  'MediaPlaceholder',
  'MdxPageSkeleton',
  'MermaidDiagram',
  'PageMeta',
  'PageTableOfContents',
  'ResourceList',
  'ScrollStage',
  'StatCard',
  'StatGrid',
  'Steps',
  'Tabs',
  'Timeline',
  'VideoBlock',
] as const

export type PortableBlockName = (typeof portableBlockNames)[number]
