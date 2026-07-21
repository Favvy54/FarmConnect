import Button from './Button.jsx'
import { AdvancedImage } from "@cloudinary/react";
import { logos } from "../libs/cloudinaryImages";

const NAV_LINKS = ['How It Works', 'Benefits', "Who It's For"]

export default function LandingHeader({ onLogin, onSignup }) {
  return (
    <header className="w-full bg-white">
      <div className="max-w-full mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <AdvancedImage cldImg={logos.header} alt="FarmConnect logo" className="w-7 h-7" />
          <span className="text-2xl font-semibold text-ink">
            Farm<span className="font-normal text-body-text text-2xl">Connect</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="text-body1 text-body-text font-regular hover:text-green-normal">
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button label="Log in" variant="filled" onClick={onLogin} />
          <Button label="Sign up" variant="outline" onClick={onSignup} />
        </div>
      </div>
    </header>
  )
}
