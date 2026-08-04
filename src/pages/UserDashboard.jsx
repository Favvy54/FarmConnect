import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Zap, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import TextField from '../components/TextField.jsx';
import { getAllListings, getAppUserProfile } from '../services/auth.js';

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
          <p className=" text-base font-bold text-ink ">
            {listing.foodName}
          </p>
          <p className="text-sm text-charcoal">
            {listing.vendorName || listing.vendorId?.businessName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-green-normal">
            {listing.isFree ? 'Free' : `₦${listing.price}`}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm gap-3">
          <p
            className={
              mealsLeft <= 3 ? 'text-error font-medium' : 'text-charcoal'
            }>
            {mealsLeft} meals left
          </p>

          <p className="text-charcoal truncate text-right">
            {location}
          </p>
        </div>
        <button className="mt-3 w-full rounded-xl bg-green-normal py-2.5 text-sm font-semibold text-white">
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
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await getAppUserProfile();
        const profile = profileRes?.data || profileRes;
        console.log('app-user profile response:', profileRes);
        
        
       setUserProfile({
         fullName: profile?.fullName || '',
         phoneNumber: profile?.phoneNumber || '',
         state: profile?.state || '',
         city: profile?.city || '',
       });

        const listingsRes = await getAllListings();

        const listings =
          listingsRes?.data || listingsRes?.listings || listingsRes || [];

        setAllListings(Array.isArray(listings) ? listings : []);
      } catch (err) {
        setError(err.message || 'Could not load listings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  console.log('User profile:', userProfile);
  console.log('All listings:', allListings);

  const matchedListings = allListings.filter((listing) => {
    const userCity = (userProfile.city || '').trim().toLowerCase();

    const vendorLocation = (
      listing.vendorId?.currentLocation ||
      listing.pickupLocation ||
      ''
    )
      .trim()
      .toLowerCase();

    return vendorLocation === userCity;
  });


  const searchedListings = matchedListings.filter((l) => {
    const matchesSearch = search
      ? l.foodName?.toLowerCase().includes(search.toLowerCase()) ||
        l.vendor?.businessName?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesCategory = activeCategory
      ? l.category === activeCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const exploreMeals = searchedListings;

 const lastChance = searchedListings.filter((listing) => {
   const mealsLeft = (listing.quantity || 0) - (listing.totalReservations || 0);

   return mealsLeft > 0 && mealsLeft <= 3;
 });

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
          placeholder="Search for meal or vendor or location"
          variant="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-muted">
          <SlidersHorizontal className="h-5 w-5 text-body-text" />
        </button>
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
      ) : (
        <div className="space-y-6">
          <ListingRow
            icon={<Zap className="h-5 w-5 text-green-normal" />}
            title="Explore Meals"
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
