# openclaw-lightpanda-tool

OpenClaw plugin exposing a fast JS-aware extraction tool backed by the [Lightpanda](https://github.com/lightpanda-io/browser) CLI.

## Tool
- `lightpanda_browser`

## What it does
Uses the Lightpanda CLI for public unauthenticated page extraction before falling back to heavier browser automation.

## Install
1. Install the Lightpanda CLI and ensure it is callable as `lightpanda`.
2. Copy this folder into `~/.openclaw/extensions/lightpanda-tool`.
3. Add `~/.openclaw/extensions` to `plugins.load.paths`.
4. Add `lightpanda-tool` to `plugins.allow`.
5. Enable the plugin in config.

## Example config
```json
{
  "plugins": {
    "allow": ["lightpanda-tool"],
    "load": {
      "paths": ["~/.openclaw/extensions"]
    },
    "entries": {
      "lightpanda-tool": {
        "enabled": true,
        "config": {
          "command": "lightpanda",
          "defaultDump": "markdown",
          "defaultStripMode": "full",
          "defaultTimeoutMs": 15000,
          "maxOutputChars": 12000
        }
      }
    }
  }
}
```

## Safety
This repo intentionally contains **no API keys, personal paths, or local machine config**.
