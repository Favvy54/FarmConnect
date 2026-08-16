import AuthLayout from '../components/AuthLayout.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { AdvancedImage } from '@cloudinary/react';
import { auth } from '../libs/cloudinaryImages.js';

export default function PasswordUpdatedScreen({ onBackToLogin }) {
  return (
    <AuthLayout>
      <div className="flex flex-col gap-8 items-center text-center">
        <AdvancedImage
          cldImg={auth.confirmation}
          className="w-45 h-45 text-green-normal"
          strokeWidth={1.5}
        />
        <div>
          <h1 className="text-h2 font-bold text-ink">Password Updated</h1>
          <p className="text-body1 text-body-text mt-3">
            Your password has been successfully reset.
          </p>
        </div>

        <PrimaryButton onClick={onBackToLogin}>Back to Login</PrimaryButton>
      </div>
    </AuthLayout>
  );
}
