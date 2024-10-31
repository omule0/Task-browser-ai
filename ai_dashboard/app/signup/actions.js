'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function signup(formData) {
    const supabase = await createClient()
  
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    }
  
    const { error } = await supabase.auth.signUp(data)
  
    if (error) {
      redirect('/error')
    }
  
    // // redirect to login page
    // if (error) {
    //   redirect('/login?message=Failed to signup')
    // }
  
    revalidatePath('/', 'layout')
    // redirect('/login')
    redirect('/')
  }