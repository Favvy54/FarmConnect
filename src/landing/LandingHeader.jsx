import { useState } from 'react';
import Button from './Button.jsx';
import { AdvancedImage } from '@cloudinary/react';
import { logos } from '../libs/cloudinaryImages';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = ['How It Works', 'Benefits', "Who It's For"];

export default function LandingHeader({ onLogin, onSignup }) {
  const [isOpen, setIsOPen] = useState(false);
  return (
    <header className=" h-20 shadow shadow-ink/10 py-5 px-3 bg-white flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AdvancedImage
          cldImg={logos.header}
          alt="FarmConnect logo"
          className="w-7 h-7"
        />
        <span className="text-2xl font-semibold text-ink">
          Farm
          <span className="font-normal text-body-text text-2xl">Connect</span>
        </span>
      </div>

      <nav className="hidden lg:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="text-body1 text-body-text font-regular hover:text-green-normal">
            {link}
          </a>
        ))}
      </nav>

      <div className="hidden lg:flex items-center gap-3">
        <Button label="Log in" variant="filled" onClick={onLogin} />
        <Button label="Sign up" variant="outline" onClick={onSignup} />
      </div>
      <button
        className=" lg:hidden text-gray-600 hover:text-gray-900 transition-colors p-0.5 cursor-pointer"
        aria-label="Open navigation menu"
        onClick={() => setIsOPen(!isOpen)}>
        {isOpen ? (
          <X size={30} strokeWidth={2} />
        ) : (
          <Menu size={30} strokeWidth={2} />
        )}
      </button>

      {/* Mobile dropdown */}

      {isOpen && (
        <div
          className="fixed pt-8 px-8 top-0 left-0 h-screen bg-white shadow-2xl transition-transform duration-300 ease-in-out  z-55 flex flex-col gap-8 w-[70%] md:w-[30%] lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'})">
          <div className="flex items-center gap-2">
            <AdvancedImage
              cldImg={logos.header}
              alt="FarmConnect logo"
              className="w-7 h-7"
            />
            <span className="text-2xl font-semibold text-ink">
              Farm
              <span className="font-normal text-body-text text-2xl">
                Connect
              </span>
            </span>
          </div>

          <nav className="flex flex-col gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="text-body1 text-body-text font-regular hover:text-green-normal">
                {link}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <Button label="Log in" variant="filled" onClick={onLogin} />
            <Button label="Sign up" variant="outline" onClick={onSignup} />
          </div>
        </div>
      )}
    </header>
  );
}
