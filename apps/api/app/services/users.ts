import { db } from '@/db/drizzle'
import { UserInsert, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const createUser = async (user: UserInsert) => {
  try {
    const newUser = await db
      .insert(users)
      .values({
        id: user.id,
        address: user.address,
        username: user.username,
        type: user.type,
      })
      .returning()

    return newUser[0]
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getUserByAddress = async (address: string) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.address, address.toLowerCase()))
    return user[0]
  } catch (error) {
    console.error(error)
    return error
  }
}
