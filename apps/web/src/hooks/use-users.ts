import { useMutation, useQuery } from '@tanstack/react-query'
import { env } from '@/env'

// Check if user exists by address
async function checkUserExists(address: string) {
  if (!address) {
    throw new Error('Address is required')
  }

  const response = await fetch(
    `${env.VITE_API_URL}/api/users?address=${encodeURIComponent(address)}`
  )

  if (response.status === 404) {
    throw new Error('USER_NOT_FOUND')
  }

  if (!response.ok) {
    throw new Error('Failed to check user')
  }

  const user = await response.json()
  if (user && user.address) {
    return user
  } else {
    throw new Error('USER_NOT_FOUND')
  }
}

// Create a new user
async function createUser(userData: {
  address: string
  username: string
  type: string
}) {
  const response = await fetch(`${env.VITE_API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error('Failed to create user')
  }

  return response.json()
}

export function useUserQuery(address: string | undefined) {
  return useQuery({
    queryKey: ['user', address],
    queryFn: () => checkUserExists(address!),
    enabled: !!address,
    retry: false,
  })
}

export function useCreateUser() {
  return useMutation({
    mutationFn: createUser,
  })
}
