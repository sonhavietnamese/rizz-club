import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PRIVY_APP_SECRET: z.string().min(1),
    AUTHORIZATION_PRIVATE_KEY: z.string().min(1),

    DATABASE_URL: z.url(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    DISCORD_TOKEN: z.string().min(1),

    SOMNIA_PRIVATE_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_PRIVY_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1),

    NEXT_PUBLIC_AUTHORIZATION_ID: z.string().min(1),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
  },
  runtimeEnv: {
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
    AUTHORIZATION_PRIVATE_KEY: process.env.AUTHORIZATION_PRIVATE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    NEXT_PUBLIC_PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_AUTHORIZATION_ID: process.env.NEXT_PUBLIC_AUTHORIZATION_ID,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    SOMNIA_PRIVATE_KEY: process.env.SOMNIA_PRIVATE_KEY,
  },
})
