import { SEMANTIC_COLORS } from '../../foundation/token-meta'
import { TokenSwatch, TokenSwatchGrid } from '../token-swatch'

export function SemanticColorGrid() {
  return (
    <TokenSwatchGrid>
      {SEMANTIC_COLORS.map(({ name, variable }) => (
        <TokenSwatch key={name} name={name} variable={variable} hint={variable} />
      ))}
    </TokenSwatchGrid>
  )
}
