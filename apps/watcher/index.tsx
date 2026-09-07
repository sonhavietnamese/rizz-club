import '@/env'
import { Dashboard } from '@/ui/dashboard'
import { render } from 'ink'

const isInteractive = Boolean(process.stdin.isTTY)
const app = render(<Dashboard />, {
  exitOnCtrlC: isInteractive,
  stdin: process.stdin,
})
await app.waitUntilExit()
