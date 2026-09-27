# @atom63/agent

## 0.3.0-beta.1

### Patch Changes

- [#73](https://github.com/atom63/atom63-design-system/pull/73) [`a7e77ba`](https://github.com/atom63/atom63-design-system/commit/a7e77ba75a5600d434aa2b2d7a77208ae7100dba) Thanks [@atom63](https://github.com/atom63)! - Add `@atom63/agent` to the design system: the headless agent runtime (`createAgentRuntime`, `createAgentStore`, `getMessageText`, `AgentTransportError` and the message, transport and state types) and the React hooks `useOwnedAgentRuntime` and `useAgentChromeController` with `DEFAULT_AGENT_CHROME_LABELS`, moved from atom63-vite with their names and signatures unchanged. `@atom63/agent` is the runtime and imports no React; the hooks are at `@atom63/agent/react`, and React is an optional peer needed only there. The package has no UI: styling the chat and rendering markdown are left to the host.
