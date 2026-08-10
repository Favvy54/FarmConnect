import { useEffect, useState } from 'react';
import ReserveMealModal, { formatDeadlineTime} from '../components/ReserveMealModal.jsx';
import { Search, SlidersHorizontal, Zap, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout.jsx';
import TextField from '../components/TextField.jsx';
import {
  getAllListings,
  getNearbyListings,
  getAppUserProfile,
} from '../services/auth.js';



const CATEGORY_PILLS = [
 "Cooked Meals",
    
        "Rice Dishes",
    
        "Soups",
    
        "Bakery",
    
        "Bread",
    
        "Pastries",
    
        "Snacks",
    
        "Fast Food",
    
        "Grilled Foods",
    
        "Seafood",
    
        "Vegetables",
    
        "Fruits",
    
        "Desserts",
    
        "Drinks",
    
        "Beverages",
    
        "Local Delicacies",
];

function MealCard({ listing, variant = 'grid', onReserve }) {
  const navigate = useNavigate();
  const image = listing.imageUrls?.[0] || '/img-placeholder.png';
  const mealsLeft = Math.max(
    0,
    (listing.quantity || 0) - (listing.totalReservations || 0),
  );
  const minutesLeft = listing.minutesLeft || 0;

  const location =
    listing.vendorId?.currentLocation ||
    listing.pickupLocation ||
    'Location unavailable';

  const handleClick = () => {
    navigate(`/user/meal/${listing._id}`, { state: { listing } });
  };

  const buttonColor =
    variant === 'urgent' ? 'bg-orange-normal' : 'bg-green-normal';
  



  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl border border-border-muted bg-white overflow-hidden shadow-sm flex flex-col cursor-pointer ${
        variant === 'urgent' ? 'w-56 shrink-0' : 'w-full'
      }`}>
      <div className="relative">
        <img
          src={image}
          alt={listing.foodName}
          className="h-40 w-full object-cover"
        />
        {variant === 'urgent' && minutesLeft > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-semibold text-orange-normal shadow">
            {minutesLeft} mins left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-3">
        <div className="flex flex-col gap-1">
          <p className="text-regular font-bold text-ink">{listing.foodName}</p>
          <p className="text-normal text-charcoal">
            {listing.vendorName || listing.vendorId?.businessName}
          </p>
        </div>

        <span className="text-normal font-semibold text-green-normal">
          {listing.isFree ? 'Free' : `₦${listing.price}`}
        </span>

        <div className="mt-1 flex items-center justify-between text-normal">
          <p
            className={
              mealsLeft <= 5 ? 'text-error font-medium' : 'text-charcoal'
            }>
            {mealsLeft} meals left
          </p>
          <p className="text-charcoal truncate text-right">{location}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onReserve?.(listing);
          }}
          className={`mt-3 w-full rounded-xl ${buttonColor} py-2.5 text-sm font-semibold text-white`}>
          Reserve now
        </button>
      </div>
    </div>
  );
}

function GridListingRow({
  icon,
  title,
  listings,
  accentClass,
  onViewMore,
  onReserve,
}) {
  const displayListings = listings.slice(0, 12);

  return (
    <div className="rounded-2xl border border-border-muted bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
        </div>
        <button
          onClick={onViewMore}
          className={`text-sm font-medium ${accentClass}`}>
          View more →
        </button>
      </div>
      <div
        className="grid grid-cols-2 gap-4
          sm:grid-cols-3
          lg:grid-cols-4
          [&>*:nth-child(n+5)]:hidden
          sm:[&>*:nth-child(n+7)]:hidden
          lg:[&>*:nth-child(n+13)]:hidden">
        {displayListings.map((l, index) => (
          <MealCard
            key={l._id || l.id || index}
            listing={l}
            variant="grid"
            onReserve={onReserve}
          />
        ))}
      </div>
    </div>
  );
}

function ScrollListingRow({
  icon,
  title,
  listings,
  accentClass,
  onViewMore,
  onReserve,
}) {
  return (
    <div className="rounded-2xl border border-border-muted bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
        </div>
        <button
          onClick={onViewMore}
          className={`text-sm font-medium ${accentClass}`}>
          View more →
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden pb-2">
        {listings.map((l, index) => (
          <MealCard
            key={l._id || l.id || index}
            listing={l}
            variant="urgent"
            onReserve={onReserve}
          />
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
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_low' | 'price_high'

  // 'nearby' = default dashboard view, 'market' = full marketplace
  const [viewMode, setViewMode] = useState('nearby');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [nearbyListings, setNearbyListings] = useState([]);
  const [marketListings, setMarketListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const [reserveListing, setReserveListing] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

    <ReserveMealModal
      listing={reserveListing}
      isOpen={!!reserveListing}
      onClose={() => setReserveListing(null)}
      onReserved={(reservation) => setConfirmedReservation(reservation)}
    />;

    {
      confirmedReservation && (
        <ReservationConfirmedModal
          pickupCode={confirmedReservation.pickupCode}
          holdMinutes={60}
          pickupDeadlineLabel={formatDeadlineTime(reserveListing) || 'Not set'}
          onClose={() => setConfirmedReservation(null)}
          onViewReservation={() => {
            setConfirmedReservation(null);
            onNavigate?.('reservations');
          }}
        />
      );
    }

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
          phoneNumber: profile?.phone || '',
          state: profile?.state || '',
          city: profile?.city || '',
        });

        // Use the browser's real GPS location for coordinate-based nearby search.
        // If location access is unavailable/denied, fall back to the existing
        // profile city/state nearby logic so the old behaviour is preserved.
        let nearby;

        if ("geolocation" in navigator) {
          nearby = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                try {
                  const { longitude, latitude } = position.coords;
                  const results = await getNearbyListings(
                    longitude,
                    latitude
                  );
                  resolve(results);
                } catch (err) {
                  console.error(
                    "Coordinate-based nearby search failed:",
                    err
                  );

                  try {
                    resolve(await getNearbyListings());
                  } catch (fallbackErr) {
                    reject(fallbackErr);
                  }
                }
              },
              async (geoError) => {
                console.warn(
                  "Browser location unavailable:",
                  geoError.message
                );

                // Preserve the existing city/state nearby-search behaviour.
                try {
                  resolve(await getNearbyListings());
                } catch (fallbackErr) {
                  reject(fallbackErr);
                }
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
              }
            );
          });
        } else {
          // Older browsers: preserve the existing nearby endpoint behaviour.
          nearby = await getNearbyListings();
        }

        setNearbyListings(Array.isArray(nearby) ? nearby : []);
      } catch (err) {
        setError(err.message || 'Could not load listings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const trimmed = search.trim();

    if (!trimmed) {
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
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

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
    search.trim() || viewMode === 'market' ? marketListings : nearbyListings;

  const filteredListings = activeListings
    .filter((l) => {
      const matchesCategory = activeCategory
        ? l.category === activeCategory
        : true;
      return matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_high') return (b.price || 0) - (a.price || 0);
      // newest first by default
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const exploreMeals = filteredListings;

  const lastChance = filteredListings.filter((listing) => {
    const mealsLeft = Math.max(
      0,
      (listing.quantity || 0) - (listing.totalReservations || 0),
    );

    const fewLeft = mealsLeft > 0 && mealsLeft <= 5;

    const endingSoon = listing.minutesLeft > 0 && listing.minutesLeft <= 30;

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
      role="user"
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

                <div className="my-1 border-t border-border-muted" />

                <button
                  onClick={() => {
                    setSortBy('newest');
                    setIsFilterOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink hover:bg-green-light/40">
                  Newest Listings
                  {sortBy === 'newest' && (
                    <Check className="h-4 w-4 text-green-normal" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSortBy('price_low');
                    setIsFilterOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink hover:bg-green-light/40">
                  Price: Low to High
                  {sortBy === 'price_low' && (
                    <Check className="h-4 w-4 text-green-normal" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSortBy('price_high');
                    setIsFilterOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink hover:bg-green-light/40">
                  Price: High to Low
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
      ) : filteredListings.length === 0 ? (
        <div className="rounded-xl border border-border-muted bg-white p-8 text-center">
          <p className="text-body1 font-medium text-ink">No listings found</p>
          <p className="mt-2 text-body-text">Try another search or category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <GridListingRow
            icon={<Zap className="h-5 w-5 text-green-normal" />}
            title={viewMode === 'market' ? 'Marketplace' : 'Explore Meals'}
            listings={exploreMeals}
            accentClass="text-green-normal"
            onViewMore={() => onNavigate?.('listings')}
            onReserve={(listing) => setReserveListing(listing)}
          />

          <ScrollListingRow
            icon={<Clock className="h-5 w-5 text-orange-normal" />}
            title="Last Chance"
            listings={lastChance}
            accentClass="text-orange-normal"
            onViewMore={() => onNavigate?.('listings')}
            onReserve={(listing) => setReserveListing(listing)}
          />

          <ReserveMealModal
            listing={reserveListing}
            isOpen={!!reserveListing}
            onClose={() => setReserveListing(null)}
              />
              
        </div>
      )}
    </DashboardLayout>
  );
}
 