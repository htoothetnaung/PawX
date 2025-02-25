import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GithubIcon } from 'lucide-react'
import Link from 'next/link'
import { login } from '@/app/login/actions'

export default function Login({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const signIn = async (formData: FormData) => {
    'use server'
    // ... existing sign in logic ...
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 to-teal-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/80 backdrop-blur-lg p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back! 🐾
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" action={login}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 
                  bg-gray-50/50 border border-gray-200 
                  placeholder-gray-400 text-gray-900 
                  transition-all duration-300 ease-in-out
                  hover:border-primary/50 hover:bg-gray-50/80
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
                  focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 
                  bg-gray-50/50 border border-gray-200 
                  placeholder-gray-400 text-gray-900 
                  transition-all duration-300 ease-in-out
                  hover:border-primary/50 hover:bg-gray-50/80
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
                  focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {searchParams?.message && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {searchParams.message}
            </p>
          )}

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign in
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
            <Button
              className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-black/90"
              type="button"
            >
              <GithubIcon className="w-5 h-5" />
              GitHub
            </Button>   
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}