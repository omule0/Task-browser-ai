'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData) {
    const supabase = await createClient()
    
    const email = formData.get('email')
    const password = formData.get('password')
    const name = formData.get('name')

    // Validate form data
    if (!email || !password || !name) {
      console.error('Missing required fields')
      redirect('/signup?error=Missing required fields')
    }
  
    console.log('Attempting signup with email:', email)

    const { error: signUpError, data: { user } } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        data: {
          full_name: name,
        }
      },
    })
  
    if (signUpError) {
      console.error('Signup error:', signUpError.message)
      redirect('/signup?error=' + encodeURIComponent(signUpError.message))
    }
  
    console.log('Signup successful, redirecting to confirmation page')
    return redirect('/confirm-email')
}