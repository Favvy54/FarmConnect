import AuthLayout from "../components/AuthLayout.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";

export default function WelcomeOnboardingScreen({ onContinue }) {
  return (
    <AuthLayout
      showTagline={false}
      showLogo={true}
      photoAlt="Vendor plating a meal while a customer reserves it on their phone, with nearby, reserved, and pickup deadline callouts">
      <div className="text-center flex flex-col gap-8">
        <div>
          <h1 className="text-h2 font-bold text-ink">
            Welcome to <span aria-hidden="true"></span>
            <br />
            FarmConnect <span aria-hidden="true"></span>
          </h1>
          <p className="text-regular text-ink mt-4">
            Let's personalize your experience. It'll only take a few minutes
          </p>
        </div>
        <PrimaryButton onClick={onContinue} className="w-[35%] mx-auto rounded-2xl text-center py-4 mt-2">Continue</PrimaryButton>
      </div>
    </AuthLayout>
  );
}
