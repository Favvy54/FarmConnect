import { useEffect, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Clock,
  Check,
  CompassIcon,
  MapPin,

} from 'lucide-react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout.jsx';
import ReserveMealModal from '@/components/ReserveMealModal.jsx';
import TextField from '../components/TextField.jsx';
import {
  getAllListings,
  getNearbyListings,
  getAppUserProfile,
  updateAppUserLocation,
  getCoordinatesFromLocation,
  getToken,
} from '../services/auth.js';

import {
  getSocket,
  connectSocket,
} from '../services/socket.js'

import LocationPicker from '../components/LocationPicker.jsx';
import MiniFarmBot from "../components/MiniFarmBot.jsx";
import ActivityTicker from '../components/ActivityTicker.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';

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
    variant === 'urgent' ? 'bg-orange-dark' : 'bg-green-normal';
  



  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl border border-border-muted bg-white overflow-hidden shadow-sm flex flex-col cursor-pointer ${
        variant === 'urgent' ? 'w-70 shrink-0' : 'w-full'
      }`}>
      <div className="relative">
        <img
          src={image}
          alt={listing.foodName}
          className="h-40 object-cover w-full"
        />
        {variant === 'urgent' && minutesLeft > 0 && (
          <span className="absolute bg-white font-semibold px-2 py-1 right-2 rounded-full shadow text-orange-normal text-xs top-2">
            {minutesLeft} mins left
          </span>
        )}
      </div>

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
          
              mealsLeft <= 5 ? 'text-error font-medium whitespace-nowrap' : 'text-charcoal whitespace-nowrap'
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
    <div className="bg-white border border-border-muted p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 items-center">
          {icon}
          <h2 className="font-semibold text-ink text-lg">{title}</h2>
        </div>
        <button
          onClick={onViewMore}
          className={`text-sm font-medium ${accentClass}`}>
          View more →
        </button>
      </div>
      <div
        className="grid grid-cols-1 gap-4
          sm:grid-cols-2
          lg:grid-cols-3
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
    <div className="bg-white border border-border-muted p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 items-center">
          {icon}
          <h2 className="font-semibold text-ink text-lg">{title}</h2>
        </div>
        <button
          onClick={onViewMore}
          className={`text-sm font-medium ${accentClass}`}>
          View more →
        </button>
      </div>
      <div className="[&::-webkit-scrollbar]:hidden flex gap-4 overflow-x-auto pb-2 scrollbar-none">
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
  //Ai state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm FarmConnect AI. I can help you find meals, understand reservations, locate pickup points, and navigate FarmConnect.",
    },
  ]);
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    phoneNumber: '',
    state: '',
    city: '',
  });
  const [sortBy, setSortBy] = useState(''); // 'newest' | 'price_low' | 'price_high'

  // 'nearby' = default dashboard view, 'market' = full marketplace
  const [viewMode, setViewMode] = useState('nearby');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [nearbyListings, setNearbyListings] = useState([]);
  const [marketListings, setMarketListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const [reserveListing, setReserveListing] = useState(null);
  const [showLocationPicker, setShowLocationPicker] =
  useState(false);

  const [selectedLocation, setSelectedLocation] =
  useState(null);
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [findingLocation, setFindingLocation] =
    useState(false);
  
  const handleReservationUpdate = (listingId, qty) => {
    const updateListings = (listings) =>
      listings.map((l) =>
        l._id === listingId
          ? {
              ...l,
              totalReservations: (l.totalReservations || 0) + qty,
            }
          : l,
      );

    setNearbyListings(updateListings);
    setMarketListings(updateListings);
  };

  const handleAISubmit = async (e) => {
  e.preventDefault();

  const trimmedMessage = aiMessage.trim();

  if (!trimmedMessage) return;

  setAiMessages((prev) => [
    ...prev,
    {
      role: 'user',
      content: trimmedMessage,
    },
  ]);

  setAiMessage('');

  // Temporary frontend response.
  // We will replace this with the real backend AI endpoint.
  setTimeout(() => {
    setAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content:
          "I'm connected to FarmConnect's assistant interface. Once the AI service is connected, I'll be able to help you search listings, understand reservations, and use your FarmConnect data.",
      },
    ]);
  }, 700);
};

  const handleManualLocation = async () => {

  if (!manualCity.trim() || !manualState.trim()) {

    setError(
      "Please enter your city and state."
    );

    return;
  }

  try {

    setFindingLocation(true);

    const coordinates =
      await getCoordinatesFromLocation(
        manualCity.trim(),
        manualState.trim()
      );

    console.log(
      "🌍 LOCATION SEARCH:",
      coordinates
    );

    if (
      !coordinates?.latitude ||
      !coordinates?.longitude
    ) {

      throw new Error(
        "Location not found."
      );

    }

    await updateAppUserLocation(
      coordinates.longitude,
      coordinates.latitude
    );

    const nearby =
      await getNearbyListings(
        coordinates.longitude,
        coordinates.latitude,
        30000
      );

    setNearbyListings(
      Array.isArray(nearby)
        ? nearby
        : []
    );

    setShowLocationPicker(false);

  } catch (error) {

    setError(
      error.message ||
      "Could not find this location."
    );

  } finally {

    setFindingLocation(false);

  }
};

    const getReliableUserLocation = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.warn(
            "⚠️ Browser geolocation not supported."
          );
    
          resolve(null);
          return;
        }
    
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const {
              latitude,
              longitude,
              accuracy,
            } = position.coords;
    
            console.log("📍 BROWSER LOCATION:", {
              latitude,
              longitude,
              accuracy,
            });
    
            if (accuracy > 10000) {
              console.warn(
                `⚠️ GPS accuracy too poor: ${accuracy}m`
              );
    
              resolve(null);
              return;
            }
    
            resolve({
              latitude,
              longitude,
              accuracy,
              source: "gps",
            });
          },
    
          (error) => {
            console.warn(
              "⚠️ Browser GPS failed:",
              error.message
            );
    
            resolve(null);
          },
    
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      });
    };
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
          profileImage: profile?.profileImage || '',
        });

        // Use the browser's real GPS location for coordinate-based nearby search.
        // If location access is unavailable/denied, fall back to the existing
        // profile city/state nearby logic so the old behaviour is preserved.
        // Use saved coordinates first.
        // This prevents the location picker/GPS from running again
        // whenever the dashboard remounts.
        const savedCoordinates = profile?.location?.coordinates;
        
        if (
          Array.isArray(savedCoordinates) &&
          savedCoordinates.length === 2
        ) {
          const [longitude, latitude] = savedCoordinates;
        
          console.log("📍 USING SAVED LOCATION:", {
            longitude,
            latitude,
          });
        
          setSelectedLocation({
            latitude,
            longitude,
          });
        
          const nearby = await getNearbyListings(
            longitude,
            latitude,
            30000
          );
        
          setNearbyListings(
            Array.isArray(nearby)
              ? nearby
              : []
          );
        
        } else {
          // No saved location yet — try browser GPS.
          const location = await getReliableUserLocation();
        
          if (!location) {
            console.warn(
              "⚠️ Accurate GPS unavailable. Waiting for manual location selection."
            );
        
            setShowLocationPicker(true);
            setLoading(false);
        
            return;
          }
        
          console.log(
            "📍 FINAL LOCATION SOURCE:",
            location.source
          );
        
          await updateAppUserLocation(
            location.longitude,
            location.latitude
          );
        
          setSelectedLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        
          const nearby = await getNearbyListings(
            location.longitude,
            location.latitude,
            30000
          );
        
          setNearbyListings(
            Array.isArray(nearby)
              ? nearby
              : []
          );
        }
        
        } catch (err) {
          setError(
            err.message || 'Could not load listings.'
          );
        } finally {
          setLoading(false);
        }
        
        })();
        }, []);

  useEffect(() => {
    let socket = getSocket();

    if (!socket) {
      console.log(
        '🔄 UserDashboard: Socket not ready. Initializing from existing session...',
      );

      const token = getToken();

      if (!token) {
        console.warn(
          '⚠️ UserDashboard: No authentication token available for Socket.IO.',
        );
        return;
      }

      socket = connectSocket(token);
    }

    if (!socket) {
      console.warn(
        '⚠️ UserDashboard: Unable to initialize Socket.IO.',
      );
      return;
    }

    const handleNewListing = async (data) => {
      console.log(
        '📥 UserDashboard received listing:new:',
        data,
      );

      try {
        /*
         * Do NOT setLoading(true) here.
         *
         * The dashboard should remain completely visible
         * while the fresh data is being fetched.
         */

        if (viewMode === 'market' || search.trim()) {
          console.log(
            '🔄 UserDashboard: Silently refreshing marketplace...',
          );

          const results = await getAllListings(search.trim());

          setMarketListings(
            Array.isArray(results) ? results : [],
          );

          console.log(
            '✅ UserDashboard: Marketplace updated silently.',
          );

          return;
        }

        /*
         * Dashboard is currently showing nearby listings.
         *
         * Refresh nearby listings silently using the user's
         * currently selected/saved coordinates.
         */

        if (
          selectedLocation?.longitude != null &&
          selectedLocation?.latitude != null
        ) {
          console.log(
            '🔄 UserDashboard: Silently refreshing nearby listings...',
          );

          const nearby = await getNearbyListings(
            selectedLocation.longitude,
            selectedLocation.latitude,
            30000,
          );

          setNearbyListings(
            Array.isArray(nearby) ? nearby : [],
          );

          console.log(
            '✅ UserDashboard: Nearby listings updated silently.',
          );

          return;
        }

        console.log(
          'ℹ️ UserDashboard: No selected location available. Skipping nearby refresh.',
        );
      } catch (err) {
        /*
         * This is a background refresh.
         *
         * Don't replace the user's current dashboard with
         * an error state if the socket-triggered refresh fails.
         */
        console.error(
          '❌ UserDashboard: Failed to update listings after listing:new:',
          err,
        );
      }
    };

    socket.on('listing:new', handleNewListing);

    console.log(
      '👂 UserDashboard listening for listing:new',
    );

    return () => {
      socket.off('listing:new', handleNewListing);

      console.log(
        '🧹 UserDashboard removed listing:new listener',
      );
    };
  }, [viewMode, search, selectedLocation]);

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
   <>
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
      }
      profileImage={userProfile.profileImage}>
      {!showLocationPicker && (
        <button
          type="button"
          onClick={() => setShowLocationPicker(true)}
          className="font-medium gap-1.5 hover:bg-green-light inline-flex items-center mb-4 px-2 py-1 rounded-lg text-green-normal text-sm transition-colors">
          <MapPin className="h-4 w-4" />
          Change location
        </button>
      )}

      {error && <p className="mb-4 text-body2 text-red-500">{error}</p>}

      {showLocationPicker && (
        <div className="bg-white border border-border-muted mb-6 p-5 rounded-2xl shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-ink text-lg">
              Set your location
            </h2>

            <p className="mt-1 text-body-text text-sm">
              We couldn't get an accurate location from your browser. Select
              your current location on the map so we can show meals within 30 km
              of you.
            </p>
          </div>

          <div className="mb-5 space-y-3">
            <TextField
              placeholder="City"
              variant="profile"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
            />

            <TextField
              placeholder="State"
              variant="profile"
              value={manualState}
              onChange={(e) => setManualState(e.target.value)}
            />

            <button
              type="button"
              onClick={handleManualLocation}
              disabled={findingLocation}
              className="bg-white border border-green-normal font-semibold px-4 py-3 rounded-xl text-green-normal text-sm w-full">
              {findingLocation ? 'Finding Location...' : 'Find Location'}
            </button>
          </div>

          <div className="bg-green-light italic mb-4 p-3 rounded-xl text-black text-sm">
            TIP: For the most accurate nearby results, use a mobile device with
            location services enabled.
          </div>

          <LocationPicker
            initialPosition={selectedLocation}
            onClose={() => setShowLocationPicker(false)}
            onSelect={(latitude, longitude) => {
              setSelectedLocation({
                latitude,
                longitude,
              });
            }}
          />

          {selectedLocation && (
            <button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);

                  await updateAppUserLocation(
                    selectedLocation.longitude,
                    selectedLocation.latitude,
                  );

                  const nearby = await getNearbyListings(
                    selectedLocation.longitude,
                    selectedLocation.latitude,
                    30000,
                  );

                  setNearbyListings(Array.isArray(nearby) ? nearby : []);

                  setShowLocationPicker(false);
                } catch (err) {
                  setError(err.message || 'Could not save your location.');
                } finally {
                  setLoading(false);
                }
              }}
              className="bg-green-normal font-semibold mt-4 px-4 py-3 rounded-xl text-sm text-white w-full">
              Use This Location
            </button>
          )}
        </div>
      )}

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
              <div className="absolute bg-white border border-border-muted mt-2 overflow-hidden right-0 rounded-xl shadow-lg w-48 z-20">
                <button
                  onClick={() => handleSelectViewMode('nearby')}
                  className="flex font-medium hover:bg-green-light/40 items-center justify-between px-4 py-3 text-ink text-left text-sm w-full">
                  Nearby Listings
                  {viewMode === 'nearby' && (
                    <Check className="h-4 text-green-normal w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleSelectViewMode('market')}
                  className="flex font-medium hover:bg-green-light/40 items-center justify-between px-4 py-3 text-ink text-left text-sm w-full">
                  Market Listings
                  {viewMode === 'market' && (
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

      <div className="[&::-webkit-scrollbar]:hidden flex gap-3 overflow-x-auto pb-1 scrollbar-none">
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

      <div className="flex flex-col gap-6">
        {loading || searching ? (
          <p className="text-body-text">Loading listings…</p>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white border border-border-muted mt-6 p-5 rounded-2xl">
            <div className="flex flex-col items-center mx-auto py-6 text-center w-[50%]">
              <div className="bg-green-light flex h-24 items-center justify-center mb-4 md:h-30 md:w-33.75 rounded-full w-27">
                <img
                  src="/empty-nearby.png"
                  alt="No Listing"
                  className="h-full object-cover w-full"
                />
              </div>
              <p className="font-medium text-ink text-regular">
                No meals nearby
              </p>
              <p className="max-w-xs mt-1 text-ink text-normal">
                There is no available listing in your area at the moment
              </p>
              <PrimaryButton
                onClick={() => window.location.reload()}
                className="mt-2 py-3 rounded-2xl text-center w-[40%]">
                <span
                  className="flex justify-center items-center
              text-normal text-white gap-1">
                  Refresh
                </span>
              </PrimaryButton>
            </div>
          </div>
          ) : (
              
          <div className="mt-6">
            <GridListingRow
              icon={<CompassIcon className="h-6 text-green-normal w-6" />}
              title={viewMode === 'market' ? 'Marketplace' : 'Explore Meals'}
              listings={exploreMeals}
              accentClass="text-green-normal"
              onViewMore={() => onNavigate?.('listings')}
              onReserve={(listing) => setReserveListing(listing)}
            />
            <ReserveMealModal
              listing={reserveListing}
              isOpen={!!reserveListing}
              onClose={() => setReserveListing(null)}
              onNavigate={onNavigate}
              onReserved={handleReservationUpdate}
            />
          </div>
        )}
        {loading || searching ? (
          <></>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white border border-border-muted p-5 rounded-2xl">
            <div className="flex flex-col items-center mx-auto py-6 text-center w-[50%]">
              <div className="bg-green-light flex h-24 items-center justify-center mb-4 md:h-30 md:w-33.75 rounded-full w-27">
                <img
                  src="/empty-last-chance-state.png"
                  alt="No Listing"
                  className="h-full object-cover w-full"
                />
              </div>
              <p className="font-medium text-ink text-regular">
                No meals nearby
              </p>
              <p className="max-w-xs mt-1 text-ink text-normal">
                There is no available listing in your area at the moment
              </p>
              <PrimaryButton
                onClick={() => window.location.reload()}
                className="mt-2 py-3 rounded-2xl text-center w-[40%]">
                <span
                  className="flex justify-center items-center
              text-normal text-white gap-1">
                  Refresh
                </span>
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <>
            <ScrollListingRow
              icon={<Clock className="h-6 text-orange-dark w-6" />}
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
              onNavigate={onNavigate}
              onReserved={handleReservationUpdate}
            />
          </>
        )}
      </div>

      {/* FLOATING AI TOOLS */}
      <div className="bottom-6 fixed flex gap-4 items-center right-6 z-50">
        {/* MINI FARM BOT */}
        <MiniFarmBot />
      </div>
    </DashboardLayout>
    <ActivityTicker />
  </> 
  );
}
 
