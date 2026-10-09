// The plugin's main thread: shows the UI, keeps settings, and runs the token
// sync engine and the Atom63 design system build against this file.
// Cipher by Atom63, You Zhang (ATOM63).
/// <reference types="@figma/plugin-typings" />

import { figmaApi, nodesApi, selectionApi } from './main/figma-api'
import { handle } from './main/handle'
import type { MainToUI, PluginSettings, UIToMain } from './messages'

figma.showUI(__html__, { width: 480, height: 640, title: 'Cipher by Atom63', themeColors: true })

const DEFAULT_SETTINGS: PluginSettings = { theme: 'system' }
const post = (message: MainToUI) => figma.ui.postMessage(message)

async function loadSettings(): Promise<PluginSettings> {
  return { ...DEFAULT_SETTINGS, ...((await figma.clientStorage.getAsync('settings')) ?? {}) }
}

async function receive(message: UIToMain) {
  try {
    if (message.type === 'load-settings') {
      post({ type: 'settings', data: await loadSettings() })
      return
    }
    if (message.type === 'save-settings') {
      await figma.clientStorage.setAsync('settings', { ...(await loadSettings()), ...message.data })
      return
    }
    const reply = await handle(figmaApi(), message, {
      nodes: nodesApi,
      selection: selectionApi,
      progress: data => post({ type: 'progress', data }),
    })
    if (reply) post(reply)
  } catch (error) {
    post({
      type: 'error',
      data: {
        message: error instanceof Error ? error.message : String(error),
        for: message.type,
      },
    })
  }
}

figma.ui.onmessage = (message: UIToMain) => void receive(message)
