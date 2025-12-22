import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_WEPIN_APP_ID: z.string().min(1),
    VITE_WEPIN_API_KEY: z.string().min(1),
  },

  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,
})
