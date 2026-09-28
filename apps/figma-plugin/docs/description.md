Design tokens from code, as Figma variables

Cipher keeps Figma in step with the tokens in your code. Code stays the source of truth: Cipher writes your tokens into Figma as variables, and turns the edits a designer makes in Figma into a change list for the code.

Sync from your project
Pick the CSS files that hold your tokens (Tailwind and shadcn projects keep them as CSS custom properties) and Cipher writes them as variables:
Each data-* attribute (brand, surface, radius, type scale…) becomes a collection with its values as modes, and light and dark become a Mode collection
var() becomes an alias, and a color at an opacity (color-mix with transparent) a composed color that keeps its alias
calc() is computed per mode
Every variable shows its CSS name in Dev Mode and appears only in the pickers it fits
Run it again after the code changes: it only writes what changed

Changes made in Figma
Cipher lists the variables you edited as changes to the CSS, with the file, the selector and the new value, ready to hand to a coding agent.

Sync the Atom63 design system
The Atom63 tokens are built in, with their personalization axes as collections.

Manage variables and styles
Batch rename, move, duplicate and edit variables and styles, rebind styles to variables, and export CSS.
