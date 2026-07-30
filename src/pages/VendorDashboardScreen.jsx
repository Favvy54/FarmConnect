import { useState, useEffect } from "react";
import {
  Store,
  Calendar,
  TrendingUp,
  Trash2,
  CirclePlus,
  Plus,
  ArrowRight,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";

import {
  getToken,
  getVendorProfile,
  getDashboardAnalytics,
} from "@/services/auth.js";

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

    // ==================== VENDOR PROFILE ====================
    // Loads the vendor's business information for the dashboard
    // (Business Name, Location, etc.)

    const vendorResponse = await fetch(
      "https://farmconnect-backend-1.onrender.com/api/vendors/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const vendorData = await vendorResponse.json();

    if (!vendorResponse.ok) {
      throw new Error(
        vendorData.message || "Failed to load vendor profile."
      );
    }

    if (!cancelled) {
      setVendor(vendorData.data);
    }

    // ==================== DASHBOARD ANALYTICS ====================

const analyticsResponse = await getDashboardAnalytics();

if (!cancelled) {
  const analytics = analyticsResponse.analytics;

  setAnalytics(analytics);

  setStats({
    listings: analytics.activeListings,
    reservations: analytics.totalReservations,
    saved: analytics.mealsShared,
    discarded: analytics.cancelledListings,
  });

  // Temporary until reservations endpoint is connected
  setReservations(initialReservations);

  // Temporary until active listings endpoint is connected
  setActiveListings(initialActiveListings);
}
    } catch (err) {
    if (!cancelled) {
      setError(
        err.message || "Could not load dashboard data."
      );
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
      location={vendor?.currentLocation || "Location unavailable"}
      profileImage={vendor?.profileImage}
    >
      <div className="w-full md:pl-2 ">
        {error && <p className="text-body2 text-red-500 mb-4">{error}</p>}

        {/* Stat cards */}
        <div className="grid mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {statCards.map(({ key, label, value, note }) => {
            const Icon = STAT_ICONS[key];
            return (
              <div
                key={key}
                className="rounded-2xl border-2 border-border-fade p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-normal font-medium text-ink">
                    {label}
                  </span>
                  <span className="w-9 h-9 rounded-full bg-green-light flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-normal text-regular" />
                  </span>
                </div>
                <p className="text-dashboard font-medium text-ink">{value}</p>
                <button className="text-caption font-semibold text-green-normal mt-1 flex items-center gap-1">
                  {note} <ArrowRight className="w-5 h-5" />
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
          <div className=" [grid-area:reservation] rounded-xl border-2 border-border-fade px-5 py-4.25 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-regular font-semibold text-ink">
                Today's Reservation
              </h2>
              <button
                onClick={onManageReservation}
                className="text-body2 text-green-normal font-semibold flex items-center gap-1">
                View all <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-center py-10">
                <div className="w-30.75 h-22.25 md:w-56.75 md:h-41 rounded-full bg-green-light flex items-center justify-center mb-4">
                  <img
                    src="/empty-reservation.png"
                    alt="No Reservation"
                    className=" w-full h-full object-cover"
                  />
                </div>
                <p className="text-regular font-medium text-ink">
                  No reservation yet
                </p>
                <p className="text-normal font text-ink mt-1 max-w-xs">
                  Once someone reserves your listing, it will appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border-fade">
                {reservations.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-5">
                      <span className="w-9 h-9 rounded-full bg-green-light" />
                      <div className="flex flex-col gap-1">
                        <p className="text-normal font-semibold text-ink">
                          {r.name}
                        </p>
                        <p className="text-body2 text-charcoal">{r.meal}</p>
                      </div>
                    </div>
                    <div className=" text-charcoal text-body2 text-center leading-1">
                      Reserved at
                      <br />
                      {r.reservedAt}
                    </div>
                    <div className="text-charcoal text-body2 text-center leading-1">
                      Pickup before
                      <br />
                      {r.pickupBefore}
                    </div>
                    <div className="text-charcoal text-center leading-1 text-body2">
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
          <div className="[grid-area:active] rounded-xl border-2 border-border-fade px-5 py-4.25">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-regular font-semibold text-ink">
                Active Listing
              </h2>
              <button
                onClick={onManageListing}
                className="text-body2 text-green-normal flex items-center gap-1">
                Manage all listing <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {activeListings.length === 0 ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-27 h-24  md:w-33.75 md:h-30 rounded-full bg-green-light flex items-center justify-center mb-4">
                  <img
                    src="/empty-listing.png"
                    alt="No Listing"
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-regular font-medium text-ink">
                  No active listing
                </p>
                <p className="text-normal text-ink mt-1 max-w-xs">
                  Create your first surplus food listing and start reaching
                  nearby people
                </p>
                <PrimaryButton
                  onClick={onCreateListing}
                  >
                  <span
                    className="flex 
                  justify-center items-center
                  text-normal text-white gap-1">
                    <Plus className="w-6 h-6" /> Create Listing
                  </span>
                </PrimaryButton>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border-muted">
                {activeListings.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={l.image}
                        alt={l.name}
                        className="w-21 h-21 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-normal  font-semibold text-ink">
                          {l.name}
                        </p>
                        <p className="text-body2 text-charcoal">
                          {l.available} available · {l.reserved} reserved
                        </p>
                      </div>
                    </div>
                    <span className="text-body2 font-medium rounded-xl px-2.5 py-1 bg-green-light text-green-normal">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="[grid-area:quick] rounded-2xl h-fit bg-green-light px-5.75 py-4.25">
            <h2 className="text-regular font-semibold text-ink mb-4.75">
              Quick Action
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={onCreateListing}
                className="flex flex-col items-center gap-2 rounded-xl bg-white px-6.25 py-2.25">
                <CirclePlus className="w-8.25 h-8.25 text-green-normal" />
                <span className="text-normal text-ink text-center font-medium">
                  Create Listing
                </span>
              </button>
              <button
                onClick={onManageListing}
                className="flex flex-col items-center gap-3 rounded-xl bg-white px-6.25 py-2.25">
                <Store className="w-8.25 h-8.25 text-green-normal" />
                <span className="text-normal text-ink text-center font-medium">
                  Manage Listing
                </span>
              </button>
              <button
                onClick={onManageReservation}
                className="flex flex-col items-center gap-3 rounded-xl bg-white px-6.25 py-2.25">
                <Calendar className="w-8.25 h-8.25 text-green-normal" />
                <span className="text-normal text-ink text-center font-medium">
                  Manage Reservation
                </span>
              </button>
              <button
                onClick={onViewAnalytics}
                className="flex flex-col items-center gap-3 rounded-xl bg-white px-6.25 py-2.25">
                <TrendingUp className="w-8.25 h-8.25 text-green-normal" />
                <span className="text-normal text-ink text-center font-medium">
                  View Analytics
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
