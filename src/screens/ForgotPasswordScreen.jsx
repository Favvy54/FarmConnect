import { Mail } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import TextField from '../components/TextField.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import BackToLogin from '../components/BackToLogin.jsx'

export default function ForgotPasswordScreen({ onSendReset, onBack }) {
  return (
    <AuthLayout>
      <BackToLogin onClick={onBack} />
      <div>
        <h1 className="text-h2 font-bold text-ink">Forgot Password</h1>
      <p className="text-body1 text-body-text mt-3">
        No worries. Enter the email address associated with your account and we'll send you a
        password reset link.
      </p>

      <form
       onSubmit={(e) => {
            e.preventDefault()
            if(e.target.checkValidity()) {
              onSignup?.()
              onSendReset?.()
            }else {
              e.target.reportValidity()
            }
        }}
        className="mt-8 flex flex-col gap-8"
      >
        <TextField icon={Mail} placeholder="Email Address" type="email" />
        <PrimaryButton type="submit">Send Reset Link</PrimaryButton>
      </form>
      </div>

      
    </AuthLayout>
  )
}
