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
    redirect('/login?message=Missing credentials')
  }


  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    redirect('/login?message=Invalid credentials or user not found')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}


export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/`,
    },
  });

  if (error) {
    console.error('Google sign-in error:', error);
    redirect("/login?message=Could not sign in with Google");
  }

  redirect(data.url);
}
