import { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import TextField from '../components/TextField.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'

export default function LoginScreen({ onLogin, onGoSignup, onForgotPassword }) {
  const [remember, setRemember] = useState(false)

  return (
    <AuthLayout>
      <div className='flex flex-col gap-4'>
        <h1 className="text-h2 font-bold text-ink">Welcome Back</h1>
      <p className="text-body1 text-body-text mt-3">
        Sign in to continue finding or sharing meals.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onLogin?.()
        }}
        className="mt-8 flex flex-col gap-4"
      >
        <TextField icon={Mail} placeholder="Email Address" type="email" />
        <TextField icon={Lock} placeholder="Password" isPassword />

        <div className="flex items-center justify-between text-body2">
          <label className="flex items-center gap-2 text-ink">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <button type="button" onClick={onForgotPassword} className="text-green-normal">
            Forgot password?
          </button>
        </div>

        <PrimaryButton type="submit" className="mt-2">
          Log in
        </PrimaryButton>

        <button
          type="button"
          onClick={onGoSignup}
          className="text-center text-body1 text-green-normal"
        >
          Don't have an account? Create one
        </button>
      </form>
      </div>
      
    </AuthLayout>
  )
}
