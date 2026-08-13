import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Grid3x3, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout.jsx';
import ReserveMealModal from '@/components/ReserveMealModal.jsx';
import TextField from '../components/TextField.jsx';
import { getAllListings, getAppUserProfile } from '../services/auth.js';

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
      className="w-full rounded-2xl border border-border-muted bg-white overflow-hidden shadow-sm flex flex-col cursor-pointer">
      <img
        src={image}
        alt={listing.foodName}
        className="h-40 w-full object-cover"
      />

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

        <div className="mt-1 flex gap-4 items-center justify-between text-normal">
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
          className="mt-3 w-full rounded-xl bg-green-normal py-2.5 text-sm font-semibold text-white">
          Reserve now
        </button>
      </div>
    </div>
  );
}

export default function UserListingsScreen({ onNavigate, onLogout }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false); // closed by default
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_low' | 'price_high'
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    state: '',
    city: '',
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reserveListing, setReserveListing] = useState(null);

  // Load profile (for the header greeting/location, same as dashboard) + the
  // full marketplace — this page's whole purpose is showing everything, no
  // nearby/GPS logic here.
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
        });

        const results = await getAllListings();
        setListings(Array.isArray(results) ? results : []);
      } catch (err) {
        setError(err.message || 'Could not load listings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      }>
      {error && <p className="mb-4 text-body2 text-red-500">{error}</p>}

      <div className="mb-6 mt-3 flex items-center gap-3">
        <TextField
          icon={Search}
          placeholder="Search by meal, category, vendor, or location"
          variant="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-[80%]"
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
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border-muted bg-white shadow-lg">
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
                  {sortBy === 'price_high' && (
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

      {loading ? (
        <p className="text-body-text">Loading listings…</p>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-xl border border-border-muted bg-white p-8 text-center">
          <p className="text-body1 font-medium text-ink">No listings found</p>
          <p className="mt-2 text-body-text">Try another search or category.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border-muted bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Grid3x3 className="h-6 w-6 text-green-normal" />
            <h2 className="text-lg font-semibold text-ink">All Listings</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      />
    </DashboardLayout>
  );
}
