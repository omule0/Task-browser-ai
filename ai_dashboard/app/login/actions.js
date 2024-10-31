'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData) {
  const supabase = await createClient()

  // Get form data
  const email = formData.get('email')
  const password = formData.get('password')

  // Validate form data
  if (!email || !password) {
    console.error('Missing email or password')
    redirect('/login?error=Missing credentials')
  }

  console.log('Attempting login with email:', email)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    redirect('/login?error=Invalid credentials')
  }

  console.log('Login successful, redirecting to dashboard')
  revalidatePath('/', 'layout')
  redirect('/')
}
