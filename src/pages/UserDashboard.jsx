import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Zap, Clock, Check } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import TextField from '../components/TextField.jsx';
import {
  getAllListings,
  getNearbyListings,
  getAppUserProfile,
} from '../services/auth.js';

const CATEGORY_PILLS = [
  'Rice Dishes',
  'Cooked Meals',
  'Pastries',
  'Bread',
  'Drinks',
  'Fast Food',
  'Local Delicacies',
];

function MealCard({ listing }) {
  const image = listing.imageUrls?.[0] || '/img-placeholder.png';
  const mealsLeft = listing.quantity - (listing.totalReservations || 0);
  const location =
    listing.vendorId?.currentLocation ||
    listing.pickupLocation ||
    'Location unavailable';

  return (
    <div className="w-[78vw]  max-w-[320px] min-w-60 sm:w-72 md:w-80 shrink-0 rounded-2xl border border-border-muted items-center bg-white overflow-hidden shadow-sm flex flex-col px-3 pb-3">
      <div className="flex-1">
        <img
          src={image}
          alt={listing.foodName}
          className=" max-w-[320px] w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between w-full">
        <div className="mt-3 flex flex-col gap-1">
          <p className=" text-regular font-bold text-ink ">{listing.foodName}</p>
          <p className="text-normal text-charcoal">
            {listing.vendorName || listing.vendorId?.businessName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-normal font-semibold text-green-normal">
            {listing.isFree ? 'Free' : `₦${listing.price}`}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-normal gap-3">
          <p
            className={
              mealsLeft <= 3 ? 'text-error font-medium' : 'text-charcoal'
            }>
            {mealsLeft} meals left
          </p>

          <p className="text-charcoal truncate text-right">{location}</p>
        </div>
        <button className="mt-3 w-full rounded-xl bg-green-normal py-2.5 text-sm font-semibold text-normal text-white">
          Reserve now
        </button>
      </div>
    </div>
  );
}

function ListingRow({ icon, title, listings, accentClass }) {
  return (
    <div className="rounded-2xl border border-border-muted bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
        </div>
        <a href="#" className={`text-sm font-medium ${accentClass}`}>
          View more →
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden pb-2">
        {listings.map((l) => (
          <MealCard key={l._id} listing={l} />
        ))}
      </div>
    </div>
  );
}

export default function UserDashboard({ onNavigate, onLogout }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    phoneNumber: '',
    state: '',
    city: '',
  });

  // 'nearby' = default dashboard view, 'market' = full marketplace
  const [viewMode, setViewMode] = useState('nearby');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [nearbyListings, setNearbyListings] = useState([]);
  const [marketListings, setMarketListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // Initial load: profile + nearby listings
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await getAppUserProfile();
        const profile = profileRes?.data || profileRes;

        setUserProfile({
          fullName: profile?.fullName || '',
          phoneNumber: profile?.phoneNumber || '',
          state: profile?.state || '',
          city: profile?.city || '',
        });

        const nearby = await getNearbyListings();
        setNearbyListings(Array.isArray(nearby) ? nearby : []);
      } catch (err) {
        setError(err.message || 'Could not load listings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Typing in search always searches the full marketplace, per product decision.
  // Switch view to 'market' automatically once there's a query; fall back to
  // 'nearby' when the box is cleared (unless the user explicitly picked
  // "Market Listings" from the filter dropdown, tracked separately below).
  useEffect(() => {
    const trimmed = search.trim();

    if (!trimmed) {
      // No active search — respect whatever the filter dropdown last set.
      return;
    }

    setViewMode('market');

    const timeout = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const results = await getAllListings(trimmed);
        setMarketListings(Array.isArray(results) ? results : []);
      } catch (err) {
        setError(err.message || 'Search failed.');
      } finally {
        setSearching(false);
      }
    }, 350); // light debounce so we're not firing a request per keystroke

    return () => clearTimeout(timeout);
  }, [search]);

  // Explicitly switching to "Market Listings" from the dropdown with an empty
  // search box should still load the full marketplace (unfiltered).
  useEffect(() => {
    if (viewMode !== 'market' || search.trim()) return;

    (async () => {
      setSearching(true);
      setError(null);
      try {
        const results = await getAllListings();
        setMarketListings(Array.isArray(results) ? results : []);
      } catch (err) {
        setError(err.message || 'Could not load marketplace listings.');
      } finally {
        setSearching(false);
      }
    })();
  }, [viewMode]);

  const activeListings =
    viewMode === 'market' ? marketListings : nearbyListings;

  const filteredListings = activeListings.filter((l) => {
    const matchesCategory = activeCategory
      ? l.category === activeCategory
      : true;
    return matchesCategory;
  });

  const exploreMeals = filteredListings;

 const lastChance = filteredListings.filter((listing) => {
   const mealsLeft = (listing.quantity || 0) - (listing.totalReservations || 0);
   const fewLeft = mealsLeft > 0 && mealsLeft <= 3;

   let endingSoon = false;
   if (listing.pickupDeadline) {
     const minutesLeft =
       (new Date(listing.pickupDeadline) - new Date()) / 60000;
     endingSoon = minutesLeft > 0 && minutesLeft <= 30;
   }

   return fewLeft || endingSoon;
 });
  
  
  const handleSelectViewMode = (mode) => {
    setViewMode(mode);
    setIsFilterOpen(false);
    if (mode === 'nearby') {
      setSearch(''); // clear any active market search when going back to nearby
    }
  };

  return (
    <DashboardLayout
      active="home"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title={
        userProfile.fullName
          ? `Welcome back, ${userProfile.fullName.split(' ')[0]} 👋`
          : 'Welcome Back 👋'
      }
      subtitle="Find affordable and free meals near you."
      location={
        userProfile.city
          ? `${userProfile.city}, ${userProfile.state}`
          : 'Location unavailable'
      }>
      {error && <p className="mb-4 text-body2 text-red-500">{error}</p>}

      <div className="mb-6 mt-3 flex items-center gap-3">
        <TextField
          icon={Search}
          placeholder="Search by meal, category, vendor, or location"
          variant="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        <div className="relative shrink-0">
          <button
            onClick={() => setIsFilterOpen((v) => !v)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
              isFilterOpen || viewMode === 'market'
                ? 'border-green-normal text-green-normal bg-green-light'
                : 'border-border-muted text-body-text'
            }`}>
            <SlidersHorizontal className="h-5 w-5" />
          </button>

          {isFilterOpen && (
            <>
              {/* click-away backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border-muted bg-white shadow-lg">
                <button
                  onClick={() => handleSelectViewMode('nearby')}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink hover:bg-green-light/40">
                  Nearby Listings
                  {viewMode === 'nearby' && (
                    <Check className="h-4 w-4 text-green-normal" />
                  )}
                </button>
                <button
                  onClick={() => handleSelectViewMode('market')}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink hover:bg-green-light/40">
                  Market Listings
                  {viewMode === 'market' && (
                    <Check className="h-4 w-4 text-green-normal" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 flex gap-3 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden pb-1">
        {CATEGORY_PILLS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'border-green-normal bg-green-light text-green-normal'
                : 'border-border-muted text-body-text'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {loading || searching ? (
        <p className="text-body-text">Loading listings…</p>
      ) : (
        <div className="space-y-6">
          <ListingRow
            icon={<Zap className="h-5 w-5 text-green-normal" />}
            title={viewMode === 'market' ? 'Marketplace' : 'Explore Meals'}
            listings={exploreMeals}
            accentClass="text-green-normal"
          />
          <ListingRow
            icon={<Clock className="h-5 w-5 text-orange-normal" />}
            title="Last Chance"
            listings={lastChance}
            accentClass="text-orange-normal"
          />
        </div>
      )}
    </DashboardLayout>
  );
}
