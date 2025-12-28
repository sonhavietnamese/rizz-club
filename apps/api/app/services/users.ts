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

    const userData = newUser[0]

    // Convert Date objects to ISO strings for JSON serialization
    return {
      ...userData,
      createdAt:
        userData.createdAt instanceof Date
          ? userData.createdAt.toISOString()
          : userData.createdAt,
      updatedAt:
        userData.updatedAt instanceof Date
          ? userData.updatedAt.toISOString()
          : userData.updatedAt,
    }
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

    if (!user[0]) {
      return null
    }

    // Convert Date objects to ISO strings for JSON serialization
    const userData = user[0]
    return {
      ...userData,
      createdAt:
        userData.createdAt instanceof Date
          ? userData.createdAt.toISOString()
          : userData.createdAt,
      updatedAt:
        userData.updatedAt instanceof Date
          ? userData.updatedAt.toISOString()
          : userData.updatedAt,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
