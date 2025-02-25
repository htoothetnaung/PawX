'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Lottie from 'react-lottie-player'
import petAnimation from '@/animations/petAnimation.json' // You'll need to add this animation

export default function ConfirmEmail() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error('Email confirmation timed out')
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

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
          Check your email! 📧
        </h2>
        
        <p className="text-gray-600">
          We've sent you a confirmation link. Please check your email to continue.
        </p>
        
        <div className="text-sm text-gray-500">
          Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>

        <div className="space-y-4">
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