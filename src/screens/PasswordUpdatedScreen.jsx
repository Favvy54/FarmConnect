import AuthLayout from "../components/AuthLayout.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { AdvancedImage } from "@cloudinary/react";
import { auth } from "../libs/cloudinaryImages";

export default function PasswordUpdatedScreen({ onBackToLogin }) {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <AdvancedImage
          cldImg={auth.confirmation}
          className="w-45 h-45 text-green-normal mb-6"
          strokeWidth={1.5}
        />
        <h1 className="text-h2 font-bold text-ink">Password Updated</h1>
        <p className="text-body1 text-body-text mt-3">
          Your password has been successfully reset.
        </p>
        <PrimaryButton onClick={onBackToLogin} className="mt-8">
          Back to Login
        </PrimaryButton>
      </div>
    </AuthLayout>
  );
}
