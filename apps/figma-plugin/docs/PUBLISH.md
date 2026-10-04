# Publishing a new version

Cipher is already published to the Figma Community (plugin ID `1613643367110247078` in
`manifest.json`). An update needs the Figma desktop app and publishes right away to everyone who
has the plugin: approved plugins are not reviewed again.

## Before publishing

1. From the repository root, build and check the plugin:

   ```bash
   pnpm --filter @atom63/figma-plugin typecheck
   pnpm --filter @atom63/figma-plugin test
   pnpm --filter @atom63/figma-plugin build
   ```

   The build writes `apps/figma-plugin/dist/code.js` and `dist/ui.html`, which `manifest.json`
   points at. The site template's token CSS that Create builds on is bundled from
   `packages/figma/template/tokens` as it is at that commit.

2. Try the build in a real file: in the desktop app, **Plugins** > **Development** > **Import
   plugin from manifest…**, pick `apps/figma-plugin/manifest.json`, then in a new file run Create,
   and in another new file Import with the site template's `src/styles/tokens`. Check that a
   second Preview finds nothing to change.

3. Move the `CHANGELOG.md` entry's date from "unreleased" to the publish date. Its text is the
   release note.

## Publishing

1. Open a file in the Figma desktop app.
2. Figma menu > **Plugins** > **Manage plugins**.
3. Open the menu next to Cipher and choose **Publish new version**. If it is missing, choose
   **Locate local version** and select `apps/figma-plugin/manifest.json` first.
4. In **Publish plugin**, paste the changelog entry into **Release notes** on the **Add final
   details** page, and update **Data security** if the plugin's data handling changed (it has no
   network access: `networkAccess.allowedDomains` is `none`).
5. Click **Publish**.

## Community page

- **Name**: Cipher by Atom63
- **Description**: `docs/description.md`
- **Icon**: `assets/icon.png` (128 × 128); **cover**: `assets/cover.png` (1920 × 960)
- **Categories**: Design Systems, Developer Tools
- **Tags**: design tokens, variables, tailwind, shadcn, css, sync, dev mode
