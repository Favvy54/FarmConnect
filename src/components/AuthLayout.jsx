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
    <div className="h-screen max-w-screen flex min-h-screen overflow-hidden">
      {/* Left photo panel — fixed, never scrolls */}
      <div className="hidden lg:flex fixed left-0 top-0 w-1/2 h-screen overflow-hidden">
        <AdvancedImage
          cldImg={photoSrc}
          alt={photoAlt}
          className="absolute inset-0 w-full h-full rounded-r-3xl object-cover"
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

      {/* Right form panel — scrolls internally when content overflows, centered when it doesn't */}
      <div className="w-full lg:ml-[50%] lg:w-1/2 h-screen overflow-y-auto py-6">
        <div className="flex items-center justify-center min-h-full px-6">
          <div className="w-full">
            {showLogo && (
              <div className="lg:hidden flex items-center gap-2 mb-8">
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
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
