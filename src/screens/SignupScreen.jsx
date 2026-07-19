import { useState } from 'react'
import { User, Mail, Phone, Lock, User as UserIcon, Store } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import TextField from '../components/TextField.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import SignupImg from "../assets/images/sign-up-img.png"

export default function SignupScreen({ onSignup, onGoLogin }) {
  const [role, setRole] = useState('find') // 'find' | 'share'
  const [agreed, setAgreed] = useState(false)

  return (
    <AuthLayout
      showTagline={false}
      showLogo={false}
      photoFit='contain'
       rightAlign = 'items-start'
      photoSrc= {SignupImg}
      photoAlt="Vendor plating a meal while a customer reserves it on their phone, with nearby, reserved, and pickup deadline callouts"
    
    >
      <div>
              <h1 className="text-h2 font-bold text-ink leading-tight">
        <span className='text-green-normal'>Create your</span>
        <br />
        FarmConnect account
      </h1>
      <p className="text-body1 text-body-text mt-4">
        Join FarmConnect to share surplus food, discover affordable meals, and help reduce food
        waste.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSignup?.()
        }}
        className="mt-8 flex flex-col gap-4"
      >
        <TextField icon={User} placeholder="Full name" />
        <TextField icon={Mail} placeholder="Email Address" type="email" />
        <TextField icon={Phone} placeholder="Phone Number" type="tel" />
        <TextField icon={Lock} placeholder="Password" isPassword />
        <TextField icon={Lock} placeholder="Confirm Password" isPassword />

        <div>
          <p className="text-body1 text-ink mb-3">I am signing up as</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('find')}
              className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-colors
                ${role === 'find' ? 'border-green-normal bg-green-light' : 'border-border-muted'}`}
            >
              <UserIcon className="w-5 h-5 text-ink" />
              <span className="text-body1 text-ink">I want to find food</span>
              <span className="text-caption text-body-text">For students, families, etc.</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('share')}
              className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-colors
                ${role === 'share' ? 'border-green-normal bg-green-light' : 'border-border-muted'}`}
            >
              <Store className="w-5 h-5 text-ink" />
              <span className="text-body1 text-ink">I want to share food</span>
              <span className="text-caption text-body-text">For caterers, restaurants, etc.</span>
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 text-body2 text-ink mt-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          I agree to the <a href="#" className="text-green-normal">Terms of Service</a> and{' '}
          <a href="#" className="text-green-normal">Privacy Policy</a>
        </label>

        <PrimaryButton type="submit" className="mt-2">
          Sign up
        </PrimaryButton>

        <button
          type="button"
          onClick={onGoLogin}
          className="text-center text-body1 text-green-normal"
        >
          Already have an account? Log in
        </button>
      </form>
      </div>

    </AuthLayout>
  )
}
