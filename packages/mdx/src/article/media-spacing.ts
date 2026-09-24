import { mdxStyles } from '../mdx-styles'

/** Vertical spacing presets for article media blocks (figures, grids, compare sliders). */
export type MediaSpacingVariant = 'none' | 'sm' | 'default' | 'lg'

/** Aligned with @atom63/mdx `mdxStyles.spacing` tokens. */
export const mediaSpacingStyles: Record<MediaSpacingVariant, string> = {
  none: '',
  sm: mdxStyles.spacing.mediaSm,
  default: mdxStyles.spacing.media,
  lg: mdxStyles.spacing.mediaLg,
}
