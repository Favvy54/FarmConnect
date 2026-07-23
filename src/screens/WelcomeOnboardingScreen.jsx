import AuthLayout from "../components/AuthLayout.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";

export default function WelcomeOnboardingScreen({ onContinue }) {
  return (
    <AuthLayout
      showTagline={false}
      showLogo={false}
      photoSrc={SignupImg}
      photoAlt="Vendor plating a meal while a customer reserves it on their phone, with nearby, reserved, and pickup deadline callouts"
    >
      <div className="text-center">
        <h1 className="text-h2 font-bold text-ink">
          Welcome to <span aria-hidden="true"></span>
          <br />
          FarmConnect <span aria-hidden="true"></span>
        </h1>
        <p className="text-body1 text-body-text mt-4">
          Let's personalize your experience. It'll only take a few minutes
        </p>
        <PrimaryButton onClick={onContinue} className="mt-8">
          Continue
        </PrimaryButton>
      </div>
    </AuthLayout>
  );
}
