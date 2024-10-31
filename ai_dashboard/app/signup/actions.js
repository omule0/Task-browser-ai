'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData) {
  const supabase = await createClient()

  // Get form data
  const email = formData.get('email')
  const password = formData.get('password')
  const name = formData.get('name')

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/`,
    },
  })

  if (error) {
    return redirect('/signup?error=' + error.message)
  }

  // Redirect to check email page or directly to dashboard if auto-confirm is enabled
  return redirect('/confirm-email')
}

export async function signupWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/`,
    },
  })

  if (error) {
    console.error('Google sign-up error:', error)
    redirect('/signup?error=Could not sign up with Google')
  }

  redirect(data.url)
}