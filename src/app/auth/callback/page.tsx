'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()
  
  useEffect(() => {
    // Handle the OAuth or email confirmation callback
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.hash)
      if (error) {
        console.error('Error with auth callback:', error)
        router.push('/login?error=Authentication failed')
        return
      }
      
      // Redirect to the intended destination after successful authentication
      router.push('/')
    }
    
    handleAuthCallback()
  }, [router, supabase])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Authenticating...</p>
    </div>
  )
}