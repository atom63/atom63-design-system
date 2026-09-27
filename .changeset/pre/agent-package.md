---
'@atom63/agent': patch
---

Add `@atom63/agent` to the design system: the headless agent runtime (`createAgentRuntime`, `createAgentStore`, `getMessageText`, `AgentTransportError` and the message, transport and state types) and the React hooks `useOwnedAgentRuntime` and `useAgentChromeController` with `DEFAULT_AGENT_CHROME_LABELS`, moved from atom63-vite with their names and signatures unchanged. `@atom63/agent` is the runtime and imports no React; the hooks are at `@atom63/agent/react`, and React is an optional peer needed only there. The package has no UI: styling the chat and rendering markdown are left to the host.
