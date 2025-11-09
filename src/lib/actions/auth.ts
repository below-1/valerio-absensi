// app/actions/auth.ts
'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { createSession, verifySession, deleteSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username and password are required' }
  }

  try {
    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (user.length === 0) {
      return { error: 'Invalid credentials' }
    }

    // Verify password
    const isValidPassword = password == user[0].password
    if (!isValidPassword) {
      return { error: 'Invalid credentials' }
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user[0].id))

    // Create session
    await createSession(user[0].id, user[0].username)

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Something went wrong' }
  }
}

export async function logout() {
  await deleteSession()
  redirect('/')
}

export async function getSession() {
  return await verifySession()
}