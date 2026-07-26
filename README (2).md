# Vendor Flow Files

Drop these folders directly into your project's `src/` folder — the paths
already match (utils/, components/, pages/), so files will land in the
right place and merge with what you already have.

## Files included

- utils/auth.js — session storage + API calls (register, login, vendor profile)
- components/VendorSidebar.jsx — shared left nav for dashboard + listings
- components/VendorTopBar.jsx — shared top bar (location, bell, profile icon)
- pages/VendorProfileScreen.jsx — "Complete your vendor profile" form, wired to createVendorProfile()
- pages/VendorDashboardScreen.jsx — dashboard, empty state by default, ENDPOINT HERE marks where to add the real analytics fetch
- pages/ManageListingScreen.jsx — listings table, empty state by default, ENDPOINT HERE marks where to add the real listings fetch

## Still needed: wire the routes

Add these three imports to the top of your `App.jsx`:

    import VendorProfileScreen from './pages/VendorProfileScreen.jsx'
    import VendorDashboardScreen from './pages/VendorDashboardScreen.jsx'
    import ManageListingScreen from './pages/ManageListingScreen.jsx'

And these three <Route> entries inside your <Routes> block:

    <Route
      path="/vendor/profile"
      element={<VendorProfileScreen onComplete={() => navigate('/vendor/dashboard')} />}
    />

    <Route
      path="/vendor/dashboard"
      element={
        <VendorDashboardScreen
          onCreateListing={() => navigate('/vendor/listings')}
          onManageListing={() => navigate('/vendor/listings')}
          onManageReservation={() => navigate('/vendor/dashboard')}
          onViewAnalytics={() => {}}
          onNavigate={(key) => {
            if (key === 'home') navigate('/vendor/dashboard')
            if (key === 'listings') navigate('/vendor/listings')
          }}
          onLogout={() => navigate('/login')}
        />
      }
    />

    <Route
      path="/vendor/listings"
      element={
        <ManageListingScreen
          onCreateListing={() => {}}
          onEditListing={() => {}}
          onNavigate={(key) => {
            if (key === 'home') navigate('/vendor/dashboard')
            if (key === 'listings') navigate('/vendor/listings')
          }}
          onLogout={() => navigate('/login')}
        />
      }
    />

## Not yet wired to a real backend

Dashboard stats and listings both currently show the EMPTY state by
default (new-vendor experience) since there's no listings/analytics
endpoint yet. Search each page file for "ENDPOINT HERE" — that's the
one spot per file to fill in once your backend engineer gives you
those two endpoints.
