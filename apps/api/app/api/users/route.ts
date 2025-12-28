import { createUser, getUserByAddress } from '@/app/services/users'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  console.log('address', address)

  if (!address) {
    return Response.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const user = await getUserByAddress(address.toLowerCase())

    if (!user) {
      return Response.json(null, { status: 404 })
    }

    return Response.json(user)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  try {
    const user = await createUser(body)
    return Response.json(user)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
