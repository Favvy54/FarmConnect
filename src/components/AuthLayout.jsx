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
  photoSrc = auth.login,
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
    <div className="h-screen max-w-screen flex min-h-screen">
      {/* Left photo panel */}

      <div className="hidden lg:block fixed left-0 top-0 lg:w-[40%] h-screen overflow-hidden">
        <AdvancedImage
          cldImg={photoSrc}
          alt={photoAlt}
          className={`absolute inset-0 w-full h-full rounded-r-3xl object-cover
          }`}
        />

        {showLogo && (
          <div className="absolute top-10 left-10 flex items-center gap-2 z-10">
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
          <div className="absolute bottom-12 left-8 right-8 text-white z-10">
            <h2 className="text-h2 font-bold leading-10">{tagline.heading}</h2>
            <p className="text-body1 mt-2 max-w-full">{tagline.body}</p>
          </div>
        )}
      </div>

      {/* Right form panel — scrolls internally only if content genuinely overflows */}

      <div
        className='w-full px-6 lg:ml-[45%]  lg:w-[50%] h-screen   py-6 '>
        <div className={`w-full `}>{children}</div>
      </div>
    </div>
  );
}
