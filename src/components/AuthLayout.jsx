/**
 * Shared layout for all auth screens: left photo panel + right form panel.
 * `showTagline` controls whether the "Discover meals near you" caption
 * overlay appears on the photo (present on most screens, absent on signup).
 */

import { AdvancedImage } from '@cloudinary/react';
import { logos, auth } from '../libs/cloudinaryImages';
export default function AuthLayout({
  children,
  showLogo = true,
  showTagline = true,
  photoFit = 'fixed', //Change object-fit to either cover or contain
  photoSrc = auth.login,
  rightAlign = 'items-center',
  photoAlt = 'Person checking a meal reservation on their phone',
  tagline = {
    heading: (
      <>
        Discover meals
        <br />
        near you
      </>
    ),
    body: 'Reserve affordable or free surplus food before the pickup deadline.',
  },
}) {
  return (
    <div className="h-screen w-full flex min-h-screen">
      {/* Left photo panel */}

      <div className="hidden md:block relative w-1/2 h-full min-h-screen">
        <AdvancedImage
  cldImg={photoSrc}
          alt={photoAlt}
          
  className={`absolute inset-0 w-1/2 h-fill rounded-r-3xl ${photoFit}
  `}
/>

        {showLogo && (
          <div className="absolute top-10 left-10 flex items-center gap-2">
            <AdvancedImage
              cldImg={logos.header}
              alt="FarmConnect logo"
              className="w-7 h-7"
            />
            <span className="text-2xl font-semibold text-white">
              Farm
              <span className="font-normal text-body-text text-2xl">
                Connect
              </span>
            </span>
          </div>
        )}

        {showTagline && (
          <div className="absolute bottom-12 left-8 right-8 text-white">
            <h2 className="text-h2 font-bold leading-10">{tagline.heading}</h2>
            <p className="text-body1 mt-2 max-w-full">{tagline.body}</p>
          </div>
        )}
      </div>

      {/* Right form panel — scrolls internally only if content genuinely overflows */}

      <div
        className={`w-full md:w-1/2 min-h-screen flex ${rightAlign === 'items-start' ? 'items-start' : 'items-center'}  px-6 py-6 md:px-16`}>
        <div className={`w-full `}>{children}</div>
      </div>
    </div>
  );
}
