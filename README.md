# FarmConnect — Auth Flow

React + Tailwind v4 build of the 7-screen auth flow: Login, Signup, Forgot
Password, Verify Email (OTP), Create New Password, Password Updated, and the
post-signup Welcome/Onboarding screen.

## Run it

```bash
npm install
npm run dev
```

## Image placeholders — you said you have the real assets

Two images are referenced by path and need to be dropped into `public/`:

- `public/auth-photo.jpg` — the lifestyle photo used on the left panel
  across every screen (referenced in `src/components/AuthLayout.jsx`,
  alt text: "Person checking a meal reservation on their phone")
- `public/logo-mark.svg` — the FarmConnect hand/leaf logo mark shown
  top-left over the photo (alt text: "FarmConnect logo")

Once those two files exist at those paths, every screen picks them up
automatically — there's only one `AuthLayout` component shared by all
seven screens, so you only need to swap the image in one place.

## Type scale (measured from your screens)

- H1: 48px — landing hero only
- H2: 40px — every auth screen title ("Welcome Back", "Create your
  FarmConnect account", "Verify your Email", etc.)
- Body1: 16px — paragraphs, inputs, buttons
- Body2: 14px — secondary/link text (standard pairing, not directly
  pixel-measured — flagged in `src/index.css`)
- Caption: 12px — fine print (same caveat as Body2)

## Colors

Base green (#4e8b45) and orange (#ffb339) were pixel-sampled directly
from your landing page export. The full light/hover/active/dark ramps
in `src/index.css` were generated programmatically from those two
values by adjusting lightness in HSL space — not sampled individually,
since your screens don't show every shade in use.

## Structure

- `src/components/AuthLayout.jsx` — the shared split photo/form panel
- `src/components/TextField.jsx` — input with icon + password toggle
- `src/components/PrimaryButton.jsx`, `BackToLogin.jsx` — shared bits
- `src/screens/` — one file per screen
- `src/App.jsx` — wires the full flow together with local state

## Landing page

`src/landing/` holds the marketing site: header, hero, how-it-works
(green section with the find/share toggle), why-choose (4 cards),
who-can-use, CTA banner, and footer. `LandingPage.jsx` composes all of
them and is now the first screen in `App.jsx` — "Log in" and "Sign up"
in the header route into the existing auth flow.

Image placeholders to swap in (all referenced by path in the landing
components, drop the real files into `public/`):

- `hero-composite.png` — vendor + phone mockup composite in the hero
- `avatar-1.jpg`, `avatar-2.jpg`, `avatar-3.jpg` — small social-proof avatars
- `vendor-photo.jpg` — chef packaging meals (Who Can Use section)
- `cta-food-photo.jpg` — round food photo in the bottom CTA banner
- `logo-mark-white.svg` — white version of the logo for the green footer
