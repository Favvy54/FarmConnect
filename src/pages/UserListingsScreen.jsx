import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Grid3x3, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout.jsx';
import ReserveMealModal from '@/components/ReserveMealModal.jsx';
import TextField from '../components/TextField.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import {
  getAllListings,
  getNearbyListings,
  getAppUserProfile,
} from '../services/auth.js';
import { getSocket } from '../services/socket.js';

const CATEGORY_PILLS = [
  'Cooked Meals',
  'Rice Dishes',
  'Soups',
  'Bakery',
  'Bread',
  'Pastries',
  'Snacks',
  'Fast Food',
  'Grilled Foods',
  'Seafood',
  'Vegetables',
  'Fruits',
  'Desserts',
  'Drinks',
  'Beverages',
  'Local Delicacies',
];

function MealCard({ listing, onReserve }) {
  const navigate = useNavigate();
  const image = listing.imageUrls?.[0] || '/img-placeholder.png';
   const mealsLeft = Math.max(
     0,
     (listing.quantity || 0) - (listing.totalReservations || 0),
   );

  const location =
    listing.vendorId?.currentLocation ||
    listing.pickupLocation ||
    'Location unavailable';

  const handleClick = () => {
    navigate(`/user/meal/${listing._id}`, { state: { listing } });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-border-muted cursor-pointer flex flex-col overflow-hidden rounded-2xl shadow-sm w-full">
      <img
        src={image}
        alt={listing.foodName}
        className="h-40 object-cover w-full"
      />

      <div className="flex flex-1 flex-col justify-between pb-3 pt-3 px-3">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-ink text-regular">{listing.foodName}</p>
          <p className="text-charcoal text-normal">
            {listing.vendorName || listing.vendorId?.businessName}
          </p>
        </div>

        <span className="font-semibold text-green-normal text-normal">
          {listing.isFree ? 'Free' : `₦${listing.price}`}
        </span>

        <div className="flex gap-4 items-center justify-between mt-1 text-normal">
          <p
            className={
              mealsLeft <= 5
                ? 'text-error font-medium whitespace-nowrap'
                : 'text-charcoal whitespace-nowrap'
            }>
            {mealsLeft} meals left
          </p>
          <p className="text-charcoal truncate">{location}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onReserve?.(listing);
          }}
          className="bg-green-normal font-semibold mt-3 py-2.5 rounded-xl text-sm text-white w-full">
          Reserve now
        </button>
      </div>
    </div>
  );
}

export default function UserListingsScreen({ onNavigate, onLogout }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // closed by default
  const [viewMode, setViewMode] = useState('market');
  // 'market' | 'nearby'
  const [sortBy, setSortBy] = useState(''); // 'newest' | 'price_low' | 'price_high'
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    state: '',
    city: '',
    profileImage: '',
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reserveListing, setReserveListing] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const profileRes = await getAppUserProfile();
        const profile = profileRes?.data || profileRes;

        setUserProfile({
          fullName: profile?.fullName || '',
          state: profile?.state || '',
          city: profile?.city || '',
          profileImage: profile?.profileImage || '',
        });

        // Default view: marketplace
        const results = await getAllListings();

        setListings(Array.isArray(results) ? results : []);
      } catch (err) {
        setError(err.message || 'Could not load listings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
  const socket = getSocket();

  if (!socket) {
    console.warn('⚠️ Socket is not available on UserListingsScreen.');
    return;
  }

  const handleNewListing = async (data) => {
    console.log('📥 listing:new received:', data);

    // Do not replace nearby results with the entire marketplace.
    if (viewMode !== 'market') {
      console.log('📍 User is viewing nearby listings. Skipping marketplace refresh.');
      return;
    }

    try {
      console.log('🔄 Refreshing marketplace listings from backend...');

      setLoading(true);

      const results = await getAllListings(search.trim());

      setListings(Array.isArray(results) ? results : []);

      console.log('✅ Marketplace listings refreshed.');
    } catch (err) {
      console.error(
        '❌ Failed to refresh listings after listing:new:',
        err,
      );
      setError(err.message || 'Could not refresh listings.');
    } finally {
      setLoading(false);
    }
  };

  socket.on('listing:new', handleNewListing);

  console.log('👂 Listening for listing:new');

  return () => {
    socket.off('listing:new', handleNewListing);
    console.log('🧹 Removed listing:new listener');
  };
}, [viewMode, search]);

  // Search debounces into a fresh market-list call, same pattern as the dashboard.
  useEffect(() => {
    const trimmed = search.trim();
    if (!trimmed) return;

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await getAllListings(trimmed);
        setListings(Array.isArray(results) ? results : []);
      } catch (err) {
        setError(err.message || 'Search failed.');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  const filteredListings = listings
    .filter((l) => (activeCategory ? l.category === activeCategory : true))
    .sort((a, b) => {
      if (sortBy === 'price_low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_high') return (b.price || 0) - (a.price || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const loadNearbyListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const profileRes = await getAppUserProfile();
      const profile = profileRes?.data || profileRes;

      const savedCoordinates = profile?.location?.coordinates;

      if (!Array.isArray(savedCoordinates) || savedCoordinates.length !== 2) {
        throw new Error(
          'Your location is not set. Please set your location first.',
        );
      }

      const [longitude, latitude] = savedCoordinates;

      const nearby = await getNearbyListings(longitude, latitude, 30000);

      setListings(Array.isArray(nearby) ? nearby : []);
    } catch (err) {
      setError(err.message || 'Could not load nearby listings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      active="listings"
      role="user"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title="Marketplace"
      subtitle="Browse every listing currently available."
      location={
        userProfile.city
          ? `${userProfile.city}, ${userProfile.state}`
          : 'Location unavailable'
      }
      profileImage={userProfile.profileImage}>
      {error && <p className="mb-4 text-body2 text-red-500">{error}</p>}

      <div className="flex gap-3 items-center mb-6 mt-3">
        <TextField
          icon={Search}
          placeholder="Search by meal, category, vendor, or location"
          variant="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lg:w-[80%] w-full"
        />

        <div className="lg:w-[20%] relative shrink-0">
          <button
            onClick={() => setIsFilterOpen((v) => !v)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
              isFilterOpen
                ? 'border-green-normal text-green-normal bg-green-light'
                : 'border-border-muted text-body-text'
            }`}>
            <SlidersHorizontal className="h-5 w-5" />
          </button>

          {isFilterOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              />
              <div className="absolute bg-white border border-border-muted mt-2 overflow-hidden right-0 rounded-xl shadow-lg w-48 z-20">
                <button
                  onClick={() => {
                    setViewMode('market');
                    setIsFilterOpen(false);

                    getAllListings().then((results) => {
                      setListings(Array.isArray(results) ? results : []);
                    });
                  }}
                  className="flex font-medium hover:bg-green-light/40 items-center justify-between px-4 py-3 text-ink text-left text-sm w-full">
                  Market Listings
                  {viewMode === 'market' && (
                    <Check className="h-4 text-green-normal w-4" />
                  )}
                </button>

                <button
                  onClick={async () => {
                    setViewMode('nearby');
                    setIsFilterOpen(false);
                    await loadNearbyListings();
                  }}
                  className="flex font-medium hover:bg-green-light/40 items-center justify-between px-4 py-3 text-ink text-left text-sm w-full">
                  Nearby Listings
                  {viewMode === 'nearby' && (
                    <Check className="h-4 text-green-normal w-4" />
                  )}
                </button>

                <div className="border-border-muted border-t my-1" />
                <button
                  onClick={() => {
                    setSortBy('newest');
                    setIsFilterOpen(false);
                  }}
                  className="flex font-medium hover:bg-green-light/40 items-center justify-between px-4 py-3 text-ink text-left text-sm w-full">
                  Newest Listings
                  {sortBy === 'newest' && (
                    <Check className="h-4 text-green-normal w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSortBy('price_low');
                    setIsFilterOpen(false);
                  }}
                  className="flex font-medium hover:bg-green-light/40 items-center justify-between px-4 py-3 text-ink text-left text-sm w-full">
                  Price: Low to High
                  {sortBy === 'price_low' && (
                    <Check className="h-4 text-green-normal w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSortBy('price_high');
                    setIsFilterOpen(false);
                  }}
                  className="flex font-medium hover:bg-green-light/40 items-center justify-between px-4 py-3 text-ink text-left text-sm w-full">
                  Price: High to Low
                  {sortBy === 'price_high' && (
                    <Check className="h-4 text-green-normal w-4" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="[&::-webkit-scrollbar]:hidden flex gap-3 mb-6 overflow-x-auto pb-1 scrollbar-none">
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

      {loading ? (
        <p className="text-body-text">Loading listings…</p>
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-col items-center mx-auto py-6 text-center w-[50%]">
          <div className="bg-green-light flex h-24 items-center justify-center mb-4 md:h-30 md:w-33.75 rounded-full w-27">
            <img
              src="/empty-nearby.png"
              alt="No Listing"
              className="h-full object-cover w-full"
            />
          </div>
          <p className="font-medium text-ink text-regular">No meals nearby</p>
          <p className="max-w-xs mt-1 text-ink text-normal">
            There is no available listing in your area at the moment
          </p>
          <PrimaryButton onClick={() => window.location.reload()}>
            <span
              className="flex justify-center items-center
              text-normal text-white gap-1">
              Refresh
            </span>
          </PrimaryButton>
        </div>
      ) : (
        <div className="bg-white border border-border-muted p-5 rounded-2xl">
          <div className="flex gap-2 items-center mb-4">
            <Grid3x3 className="h-6 text-green-normal w-6" />
            <h2 className="font-semibold text-ink text-lg">All Listings</h2>
          </div>
          <div className="gap-4 grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2">
            {filteredListings.map((l, index) => (
              <MealCard
                key={l._id || l.id || index}
                listing={l}
                onReserve={(listing) => setReserveListing(listing)}
              />
            ))}
          </div>
        </div>
      )}

      <ReserveMealModal
        listing={reserveListing}
        isOpen={!!reserveListing}
        onClose={() => setReserveListing(null)}
        onNavigate={onNavigate}
        onReserved={(listingId, qty) => {
          setListings((prev) =>
            prev.map((l) =>
              l._id === listingId
                ? { ...l, totalReservations: (l.totalReservations || 0) + qty }
                : l,
            ),
          );
        }}
      />
    </DashboardLayout>
  );
}
