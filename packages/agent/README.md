# @atom63/agent

The Atom63 headless agent runtime: a chat state machine over a streaming transport you provide,
and React hooks to own it and drive chat chrome. It renders nothing.

```bash
pnpm add @atom63/agent
```

- `@atom63/agent` — `createAgentRuntime`, `createAgentStore`, `getMessageText`,
  `AgentTransportError` and the message, transport and state types. No React.
- `@atom63/agent/react` — `useOwnedAgentRuntime`, `useAgentChromeController` and
  `DEFAULT_AGENT_CHROME_LABELS`. Needs React 19.

Styling the transcript and rendering markdown are the host's job. See the design system's
[Agent runtime pattern page](https://system.atom63.io/patterns/pattern-agent) for the state
machine, the transport contract and the hooks.
