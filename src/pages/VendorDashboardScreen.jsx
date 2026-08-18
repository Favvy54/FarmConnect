import { useState, useEffect } from 'react';
import {
  Store,
  Calendar,
  TrendingUp,
  Trash2,
  CirclePlus,
  Plus,
  ArrowRight,
} from 'lucide-react';

import DashboardLayout from '../components/DashboardLayout.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';

import {
  getToken,
  getVendorProfile,
  getDashboardAnalytics,
  getVendorReservations,
  getMyListings,
} from '../services/auth.js';
import MiniFarmBot from "../components/MiniFarmBot";

const STAT_ICONS = {
  listings: Store,
  reservations: Calendar,
  saved: Store,
  discarded: Trash2,
};

export default function VendorDashboardScreen({
  initialStats = {
    listings: 0,
    reservations: 0,
    saved: 0,
    discarded: 0,
  },
  initialReservations = [],
  initialActiveListings = [],
  onCreateListing,
  onManageListing,
  onManageReservation,
  onViewAnalytics,
  onNavigate,
  onLogout,
}) {
  const [stats, setStats] = useState(initialStats);
  const [reservations, setReservations] = useState(initialReservations);
  const [activeListings, setActiveListings] = useState(initialActiveListings);

  const [vendor, setVendor] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();



        const vendorResponse = await fetch(
          'https://farmconnect-backend-1.onrender.com/api/vendors/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const vendorData = await vendorResponse.json();

        if (!vendorResponse.ok) {
          throw new Error(
            vendorData.message || 'Failed to load vendor profile.',
          );
        }

        if (!cancelled) {
          setVendor(vendorData.data);
        }

        // ==================== DASHBOARD ANALYTICS ====================

        const analyticsResponse = await getDashboardAnalytics();
        const listingsResponse = await getMyListings();
        const reservationsResponse = await getVendorReservations();

        if (!cancelled) {
          const analytics = analyticsResponse.analytics;

          setAnalytics(analytics);

          setActiveListings(
            listingsResponse
              .filter(
                (listing) =>
                  listing.status === 'available' &&
                  listing.isActive === true,
              )
              .map((listing) => ({
                id: listing._id,
                image: listing.imageUrls?.[0] || '/img-placeholder.png',
                name: listing.foodName,
                available: listing.quantity,
                reserved: listing.totalQuantity - listing.quantity,
                status: 'ACTIVE',
              })),
          );

          const today = new Date();

          const todaysReservations =
            reservationsResponse.data.filter((reservation) => {

              if (reservation.status !== 'reserved') {
                return false;
              }

              const reservationDate =
                new Date(reservation.createdAt);

              return (
                reservationDate.getDate() === today.getDate() &&
                reservationDate.getMonth() === today.getMonth() &&
                reservationDate.getFullYear() === today.getFullYear()
              );

            });

          setReservations(
            todaysReservations.map((reservation) => ({
              id: reservation._id,

              name:
                reservation.user?.fullName ||
                'Customer',

              meal:
                reservation.listing?.foodName ||
                'Meal',

              reservedAt:
                new Date(
                  reservation.createdAt,
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),

              pickupBefore:
                reservation.listing?.expiresAt
                  ? new Date(
                    reservation.listing.expiresAt,
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  : '—',

              timeRemaining:
                reservation.timeRemaining ||
                '—',

              status: 'Reserved',
            })),
          );

          setStats({
            listings: analytics.activeListings,

            reservations:
              todaysReservations.length,

            saved: analytics.mealsShared,

            discarded: analytics.discardedMeals,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load dashboard data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    {
      key: 'listings',
      label: 'Active listings',
      value: stats.listings,
      note: 'View all',
    },
    {
      key: 'reservations',
      label: 'Reservations Today',
      value: stats.reservations,
      note: 'View all',
    },
    {
      key: 'saved',
      label: 'Meals Saved',
      value: stats.saved,
      note: 'This week',
    },
    {
      key: 'discarded',
      label: 'Discarded Meals',
      value: stats.discarded,
      note: 'This week',
    },
  ];

  const statusStyles = {
    Reserved: 'bg-green-light text-green-normal',
    Completed: 'bg-blue-50 text-blue-500',
    Cancelled: 'bg-red-50 text-error',
  };

  const displayName = vendor?.businessName || 'there';

  return (
    <DashboardLayout
      active="home"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title={`Welcome Back ${displayName} 👋`}
      subtitle="Here's what's happening with your business today."
      location={vendor?.currentLocation || 'Location unavailable'}
      profileImage={vendor?.profileImage}>
      <div className="md:pl-2 w-full">
        {error && <p className="mb-4 text-body2 text-red-500">{error}</p>}

        {/* Stat cards */}
        <div className="gap-3 grid grid-cols-1 lg:grid-cols-4 mb-6 md:grid-cols-2 mt-10">
          {statCards.map(({ key, label, value, note }) => {
            const Icon = STAT_ICONS[key];
            return (
              <div
                key={key}
                className="border-2 border-border-fade p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-ink text-normal">
                    {label}
                  </span>
                  <span className="bg-green-light flex h-9 items-center justify-center rounded-full w-9">
                    <Icon className="h-6 text-green-normal text-regular w-6" />
                  </span>
                </div>
                <p className="font-medium text-dashboard text-ink">{value}</p>
                <button className="flex font-semibold gap-1 items-center mt-1 text-caption text-green-normal">
                  {note} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>

        <div
          className="grid gap-6 [grid-template-areas:'quick''reservation''active']
        md:[grid-template-areas:'quick''reservation''active']
        lg:grid-cols-[1fr_1fr]
        lg:[grid-template-areas:'reservation_reservation''active_quick']">
          {/* Today's Reservation */}
          <div className="[grid-area:reservation] border-2 border-border-fade mb-6 px-5 py-4.25 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink text-regular">
                Today's Reservation
              </h2>
              <button
                onClick={onManageReservation}
                className="flex font-semibold gap-1 items-center text-body2 text-green-normal">
                View all <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="flex flex-col gap-2 items-center py-10 text-center">
                <div className="bg-green-light flex h-22.25 items-center justify-center mb-4 md:h-41 md:w-56.75 rounded-full w-30.75">
                  <img
                    src="/empty-reservation.png"
                    alt="No Reservation"
                    className="h-full object-cover w-full"
                  />
                </div>
                <p className="font-medium text-ink text-regular">
                  No reservation yet
                </p>
                <p className="font max-w-xs mt-1 text-ink text-normal">
                  Once someone reserves your listing, it will appear here
                </p>
              </div>
            ) : (
              <div className="divide-border-fade divide-y flex flex-col">
                {reservations.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-6">
                    <div className="flex gap-5 items-center">
                      <span className="bg-green-light h-9 rounded-full w-9" />
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-ink text-normal">
                          {r.name}
                        </p>
                        <p className="text-body2 text-charcoal">{r.meal}</p>
                      </div>
                    </div>
                    <div className="leading-1 text-body2 text-center text-charcoal">
                      Reserved at
                      <br />
                      {r.reservedAt}
                    </div>
                    <div className="leading-1 text-body2 text-center text-charcoal">
                      Pickup before
                      <br />
                      {r.pickupBefore}
                    </div>
                    <div className="leading-1 text-body2 text-center text-charcoal">
                      Time remaining
                      <br />
                      {r.timeRemaining ?? '—'}
                    </div>
                    <span
                      className={`text-body2 font-medium rounded-full px-3 py-1 ${statusStyles[r.status] || ''}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Listing */}
          <div className="[grid-area:active] border-2 border-border-fade px-5 py-4.25 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink text-regular">
                Active Listing
              </h2>
              <button
                onClick={onManageListing}
                className="flex gap-1 items-center text-body2 text-green-normal">
                Manage all listing <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {activeListings.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="bg-green-light flex h-24 items-center justify-center mb-4 md:h-30 md:w-33.75 rounded-full w-27">
                  <img
                    src="/empty-listing.png"
                    alt="No Listing"
                    className="h-full object-cover w-full"
                  />
                </div>
                <p className="font-medium text-ink text-regular">
                  No active listing
                </p>
                <p className="max-w-xs mt-1 text-ink text-normal">
                  Create your first surplus food listing and start reaching
                  nearby people
                </p>
                <PrimaryButton onClick={onCreateListing}>
                  <span
                    className="flex 
                  justify-center items-center
                  text-normal text-white gap-1">
                    <Plus className="h-6 w-6" /> Create Listing
                  </span>
                </PrimaryButton>
              </div>
            ) : (
              <div className="divide-border-muted divide-y flex flex-col">
                {activeListings.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4">
                    <div className="flex gap-3 items-center">
                      <img
                        src={l.image}
                        alt={l.name}
                        className="h-21 object-cover rounded-xl w-21"
                      />
                      <div>
                        <p className="font-semibold text-ink text-normal">
                          {l.name}
                        </p>
                        <p className="text-body2 text-charcoal">
                          {l.available} available · {l.reserved} reserved
                        </p>
                      </div>
                    </div>
                    <span className="bg-green-light font-medium px-2.5 py-1 rounded-xl text-body2 text-green-normal">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="[grid-area:quick] bg-green-light h-fit px-5.75 py-4.25 rounded-2xl">
            <h2 className="font-semibold mb-4.75 text-ink text-regular">
              Quick Action
            </h2>
            <div className="gap-3 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2">
              <button
                onClick={onCreateListing}
                className="bg-white flex flex-col gap-2 items-center px-6.25 py-2.25 rounded-xl">
                <CirclePlus className="h-8.25 text-green-normal w-8.25" />
                <span className="font-medium text-center text-ink text-normal">
                  Create Listing
                </span>
              </button>
              <button
                onClick={onManageListing}
                className="bg-white flex flex-col gap-3 items-center px-6.25 py-2.25 rounded-xl">
                <Store className="h-8.25 text-green-normal w-8.25" />
                <span className="font-medium text-center text-ink text-normal">
                  Manage Listing
                </span>
              </button>
              <button
                onClick={onManageReservation}
                className="bg-white flex flex-col gap-3 items-center px-6.25 py-2.25 rounded-xl">
                <Calendar className="h-8.25 text-green-normal w-8.25" />
                <span className="font-medium text-center text-ink text-normal">
                  Manage Reservation
                </span>
              </button>
              <button
                onClick={onViewAnalytics}
                className="bg-white flex flex-col gap-3 items-center px-6.25 py-2.25 rounded-xl">
                <TrendingUp className="h-8.25 text-green-normal w-8.25" />
                <span className="font-medium text-center text-ink text-normal">
                  View Analytics
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* MINI FARM BOT */}
        <div className="flex justify-end mt-6">
          <MiniFarmBot />
        </div>
      </div>
    </DashboardLayout>
  );
}
