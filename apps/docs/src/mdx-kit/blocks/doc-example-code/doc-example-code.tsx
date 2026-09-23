import { CodeBlock } from '../code-block'

export type DocExampleCodeProps = {
  code: string
  lang?: string
}

export function DocExampleCode({ code, lang = 'tsx' }: DocExampleCodeProps) {
  return (
    <CodeBlock
      className="doc-example-code-panel my-0 rounded-none border-0"
      code={code}
      lang={lang}
      maxHeight="max-h-[min(24rem,60vh)]"
      showCopyButton={false}
      spacing="none"
      variant="embedded"
    />
  )
}
