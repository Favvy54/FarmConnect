import { useState, useEffect } from 'react';
import {SearchIcon, Plus, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import TextField from '@/components/TextField.jsx';
import { getMyListings } from "../services/auth";

const TABS = ['All', 'Active', 'Sold Out', 'Expired'];

const statusStyles = {
  ACTIVE: "bg-green-light text-green-normal",
  "SOLD OUT": "bg-orange-light text-orange-dark",
  EXPIRED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-500",
};
export default function ManageListingScreen({
  initialListings = [], // [{ image, name, createdOn, status, available, reserved, left, pickupEnds }]
  onCreateListing,
  onEditListing,
  onNavigate,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [listings, setListings] = useState(initialListings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

async function loadListings() {
  setLoading(true);
  setError(null);

  try {
    const listings = await getMyListings();
    if (!cancelled) {
      const formatted = listings.map((listing) => ({
  id: listing._id,

  image:
    listing.imageUrls?.[0] || "/img-placeholder.png",

  name: listing.foodName,

  createdOn: new Date(listing.createdAt).toLocaleDateString(),

  status:
    listing.status === "available"
      ? "ACTIVE"
      : listing.status === "completed"
      ? "SOLD OUT"
      : "EXPIRED",

  available:
    listing.quantity - listing.totalReservations,

  reserved:
    listing.totalReservations,

  left:
    listing.quantity - listing.totalReservations,

  pickupEnds: new Date(
    listing.expiresAt
  ).toLocaleString(),
}));

      setListings(formatted);
    }
  } catch (err) {
    if (!cancelled) {
      setError(err.message || "Could not load listings.");
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

    loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = {
    All: listings.length,
    Active: listings.filter((l) => l.status === 'ACTIVE').length,
    'Sold Out': listings.filter((l) => l.status === 'SOLD OUT').length,
    Expired: listings.filter((l) => l.status === 'EXPIRED').length,
  };

  const filtered =
    activeTab === 'All'
      ? listings
      : listings.filter((l) => l.status === activeTab.toUpperCase());

  return (
    <DashboardLayout
      active="listings"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title="Manage Listings"
      subtitle="Here's what happening with your business today.">
      <div className=" w-full md:pl-2">
        {/* Tabs */}
        {error && <p className="text-body2 text-red-500 mb-4">{error}</p>}
        <div className="flex w-full items-center justify-between my-8 gap-7">
          <TextField
            icon={SearchIcon}
            placeholder="Search Listings"
            variant="search"
            className="md:w-[60%] lg:w-[80%] flex items-center py-3"
          />
          <PrimaryButton
            onClick={onCreateListing}
            className=" md:w-[35%] lg:w-[30%]  flex items-center justify-center  py-2 px-2 rounded-xl md:px-3 md:py-3">
            <span
              className="flex
                            justify-center items-center
                            md:text-normal text-white gap-1">
              <Plus className="w-6 h-6 sm:text-center" />
              <p className="hidden md:block">Create Listing </p>
            </span>
          </PrimaryButton>
        </div>
        <div className="flex justify-between border-b-4 border-border-muted mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-caption md:text-regular border-b-4 -mb-1 transition-colors
                ${
                  activeTab === tab
                    ? ' border-b-2 border-green-normal text-green-normal font-medium'
                    : 'border-transparent text-body-text'
                }`}>
              {tab}({counts[tab]})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="lg:w-59.5 lg:h-53 rounded-full bg-green-light flex items-center justify-center mb-4">
              <img
                src="/empty-listing.png"
                alt="No Listing"
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-regular font-medium text-ink">
              No active listing
            </p>
            <p className="text-normal font-regular text-ink mt-1 max-w-xs">
              Create your first surplus food listing and start reaching nearby
              people
            </p>
            <PrimaryButton
              onClick={onCreateListing}
              className="md:max-w-sm mt-4 w-auto rounded-xl px-6 py-3">
              <span
                className="flex 
                            justify-center items-center
                            text-regular text-white gap-1">
                <Plus className="w-6 h-6" /> Create Listing
              </span>
            </PrimaryButton>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border-muted overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr_auto] bg-[#f3f3f3] px-6 py-3.25  text-charcoal text-normal font-bold">
                <span>Listing</span>
                <span>Status</span>
                <span>Availability</span>
                <span>Pickup ends</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-border-muted">
                {filtered.map((l, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_1fr_1.2fr_1fr_auto] items-center px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={l.image}
                        alt={l.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-body1 font-bold text-ink">
                          {l.name}
                        </p>
                        <p className="text-body2 text-body-text">
                          Created on {l.createdOn}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`w-fit text-body2 font-medium rounded-full px-3 py-1 ${statusStyles[l.status] || ''}`}>
                      {l.status}
                    </span>
                    <div className="text-body2 text-ink">
                      {l.available} Available
                      <br />
                      {l.reserved} Reserved
                      <br />
                      {l.left} Left
                    </div>
                    <span className="text-body1 text-ink">{l.pickupEnds}</span>
                    <button
                      onClick={() => onEditListing?.(l)}
                      className="rounded-lg border border-border-muted px-4 py-1.5 text-body2 text-ink w-fit">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 text-body2 text-body-text">
              <span>
                Showing 1 to {filtered.length} of {filtered.length} listings
              </span>
              <div className="flex items-center gap-3">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-green-normal font-medium">1</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
