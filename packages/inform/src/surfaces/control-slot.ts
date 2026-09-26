/*
 * Geometry shared by everything that sits in a message row's gutters — the
 * leading icon and the trailing dismiss control.
 *
 * Both slots are exactly one line tall. That is the whole trick: give the
 * gutters the same height as the first line of text and, laid out from the
 * top, their optical centres coincide with it for free. No magic offset, and
 * it holds whether the message is one line or a title plus three.
 *
 * The slot class carries the matching typography as well as the size: `1lh`
 * resolves against the SLOT's own line-height, not the text beside it, and
 * inheriting it silently produced the wrong height in the flyout, where the
 * slot sits outside the styled text block. See `inform-parts.css`.
 */

/** One line box. Matches the first line of text the slot sits beside. */
export const SLOT_SIZE_CLASS = 'a63-Inform-slot'
