import { Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import TextField from '../components/TextField.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import BackToLogin from '../components/BackToLogin.jsx'

export default function NewPasswordScreen({ onUpdate, onBack }) {
  return (
    <AuthLayout>
      <BackToLogin onClick={onBack} />
      <div>
        <h1 className="text-h2 font-bold text-ink">Create a New Password</h1>
      <p className="text-body1 text-body-text mt-3">
        Your identity has been verified. Create a new password to secure your account.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onUpdate?.()
        }}
        className="mt-8 flex flex-col gap-4"
      >
        <TextField icon={Lock} placeholder="Password" isPassword />
        <TextField icon={Lock} placeholder="Confirm Password" isPassword />
        <PrimaryButton type="submit">Update Password</PrimaryButton>
      </form>
      </div>

      
    </AuthLayout>
  )
}
