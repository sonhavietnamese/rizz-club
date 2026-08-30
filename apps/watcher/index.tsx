import './src/env.ts'
import { render } from 'ink'
import React from 'react'
import { Dashboard } from './src/ui/dashboard.tsx'

const isInteractive = Boolean(process.stdin.isTTY)
const app = render(<Dashboard />, {
  exitOnCtrlC: isInteractive,
  stdin: process.stdin,
})
await app.waitUntilExit()
