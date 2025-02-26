'use client'

import { useRouter } from 'next/navigation'
import Lottie from 'react-lottie-player'
import petAnimation from '@/animations/restricted-pet.json' // You'll need to add this
import { Button } from '@/components/ui/button'

export default function RestrictedAccess() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-100 to-teal-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/80 backdrop-blur-lg p-8 shadow-xl text-center">
        <Lottie
          loop
          animationData={petAnimation}
          play
          style={{ width: 200, height: 200, margin: '0 auto' }}
        />
        
        <h2 className="text-2xl font-bold text-gray-900">
          Oops! This area is restricted 🐾
        </h2>
        
        <p className="text-gray-600">
          Please sign in or create an account to access this feature.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Sign In
          </Button>
          
          <Button
            onClick={() => router.push('/signup')}
            variant="outline"
            className="w-full"
          >
            Create Account
          </Button>
          
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
} 