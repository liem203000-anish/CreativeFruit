---
name: no-kill-processes
description: Strictly prohibit killing any processes, especially opencode. Use safe alternatives instead.
license: MIT
compatibility: opencode
---

## What I do
- Prevent accidentally killing opencode or other critical processes
- Force asking user permission before any process termination
- Provide safe alternatives to process killing

## Rules (MUST FOLLOW)
1. **NEVER** use `kill`, `taskkill`, `Stop-Process`, or any process termination command
2. **NEVER** kill processes matching: opencode, node, python, npm, or any development tools
3. **ALWAYS** ask user before terminating ANY process
4. Use alternatives: `Ctrl+C` for graceful shutdown, or just let processes run

## When to use me
Use this skill in every session. Process killing is disabled by default.
If you think a process needs to be killed, explain why and ask user first.
