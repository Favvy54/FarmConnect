import { useEffect, useRef, useState } from 'react';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase.js';
import { Upload, Clock, MapPin, X, CheckCircle2 } from 'lucide-react';

import DashboardLayout from '../components/DashboardLayout.jsx';
import TextField from '../components/TextField.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import LocationPicker from '../components/LocationPicker.jsx';

import {
  createListing,
  getVendorProfile,
  updateCurrentVendorLocation,
  updateVendorLocation,
  getLocationFromCoordinates,
  getCoordinatesFromLocation,
} from '../services/auth.js';

import { uploadImageToCloudinary } from '../services/uploadImage.js';
import notify from '../services/toast';

const CATEGORY_OPTIONS = [
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

export default function CreateListingScreen({
  onNavigate,
  onBack,
  onLogout,
}) {
  const fileInputRef = useRef(null);

  const [mealName, setMealName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(2);
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState('');

  const [expiryDuration, setExpiryDuration] = useState(720);
  const [locationMode, setLocationMode] = useState('vendor');

  const [vendorAddress, setVendorAddress] = useState('');

  const [customStreet, setCustomStreet] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');

  // NEW: coordinates for a custom pickup location
  const [customLatitude, setCustomLatitude] = useState(null);
  const [customLongitude, setCustomLongitude] = useState(null);

  const [showLocationModal, setShowLocationModal] = useState(false);

  const [photoFile, setPhotoFile] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pickupTime, setPickupTime] = useState('');

  /*
   * NEW:
   * When the vendor enters the create-listing page,
   * update the vendor's current GPS location.
   *
   * This does NOT change the listing pickup location.
   * It simply keeps the vendor's current location updated.
   */
  useEffect(() => {
    (async () => {
      try {
        const res = await getVendorProfile();

        console.log(
          'vendor profile response:',
          res
        );

        const vendor = res?.data;

        const parts = [
          vendor?.businessName,
          vendor?.permanentAddress,
        ].filter(Boolean);

        setVendorAddress(
          parts.join(' — ') ||
            'No business address on file'
        );

        // Update vendor's current GPS location
        try {
          await updateCurrentVendorLocation();

          console.log(
            'Vendor GPS location updated.'
          );
        } catch (locationError) {
          console.warn(
            'Could not update vendor GPS location:',
            locationError
          );
        }
      } catch (err) {
        console.error(
          'Failed to load vendor profile:',
          err
        );

        setVendorAddress(
          'Could not load business address'
        );
      }
    })();
  }, []);

const handleMapLocationSelect = async (latitude, longitude) => {
  setCustomLatitude(latitude);
  setCustomLongitude(longitude);

  try {

    await updateVendorLocation(longitude, latitude);
    const address = await getLocationFromCoordinates(
      longitude,
      latitude
    );

    if (address) {
      setCustomStreet(address.street || '');
      setCustomCity(address.city || '');
      setCustomState(address.state || '');
    }
  } catch (error) {
    console.warn(
      'Could not get address for selected location:',
      error
    );
  }
};

const handleAddressChange = async () => {
  if (
    !customStreet.trim() ||
    !customCity.trim() ||
    !customState.trim()
  ) {
    notify.error('Please enter street, city and state.');
    return;
  }

  try {
    const coordinates = await getCoordinatesFromLocation(
      customStreet.trim(),
      customCity.trim(),
      customState.trim()
    );

    console.log('ADDRESS → COORDINATES:', coordinates);

    const latitude = Number(coordinates?.latitude);
    const longitude = Number(coordinates?.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      notify.error('Could not find coordinates for this address.');
      return;
    }

    setCustomLatitude(latitude);
    setCustomLongitude(longitude);

    console.log('MAP SHOULD MOVE TO:', {
      latitude,
      longitude,
    });

    notify.success('Location found.');
  } catch (error) {
    console.error(
      'Could not get coordinates from address:',
      error
    );

    notify.error(
      error.message ||
        'Could not find this location.'
    );
  }
};
 

  const MAX_PHOTOS = 3;

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (photoFile.length >= MAX_PHOTOS) {
      notify.error(
        `You can only upload up to ${MAX_PHOTOS} photos.`
      );

      e.target.value = '';
      return;
    }

    const remainingSlots =
      MAX_PHOTOS - photoFile.length;

    const filesToAdd = files.slice(
      0,
      remainingSlots
    );

    const newPreviews =
      filesToAdd.map((file) =>
        URL.createObjectURL(file)
      );

    setPhotoFile((prev) => [
      ...prev,
      ...filesToAdd,
    ]);

    setPhotoPreview((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotoFile((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPhotoPreview((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const customAddress = [
    customStreet,
    customCity,
    customState,
  ]
    .filter(Boolean)
    .join(', ');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const toastId = notify.loading(
      'Publishing listing...'
    );

    try {
      let imageUrls = [];

      if (photoFile.length) {
        imageUrls = await Promise.all(
          photoFile.map((file) =>
            uploadImageToCloudinary(file)
          )
        );
      }

      /*
       * Base listing payload.
       */
      const payload = {
        foodName: mealName,
        category,
        description,
        quantity: Number(quantity),

        useVendorLocation:
          locationMode === 'vendor',

        pickupLocation:
          locationMode === 'vendor'
            ? vendorAddress
            : customAddress,

        imageUrls,

        isHealthy: false,

        isFree,

        price: isFree
          ? 0
          : Number(price),

        expiryDuration,
      };

      /*
       * NEW:
       * If the vendor selected a custom location,
       * send the exact coordinates selected on the map.
       */
      if (locationMode === 'custom') {
        if (
          customLatitude === null ||
          customLongitude === null
        ) {
          throw new Error(
            'Please select a pickup location on the map or enter a valid address.'
          );
        }
      
        payload.latitude = Number(customLatitude);
        payload.longitude = Number(customLongitude);
      }

      console.log(
        'Listing payload:',
        payload
      );

      const res =
        await createListing(payload);

      const created =
        res?.data?.listing ||
        res?.data ||
        res;

      logEvent(
        analytics,
        'listing_created',
        {
          listing_id: created?.id,
          category: payload.category,
          is_free: payload.isFree,
        }
      );

      notify.dismiss(toastId);

      notify.success(
        'Listing published successfully!'
      );

      setLoading(false);
      setShowSuccess(true);
    } catch (err) {
      notify.dismiss(toastId);

      notify.error(
        err.message ||
          'Something went wrong publishing your listing.'
      );

      setLoading(false);
    }
  };

  const handleViewListings = () => {
    setShowSuccess(false);

    onNavigate?.('listings');
  };

  return (
    <DashboardLayout
      active="listings"
      onNavigate={onNavigate}
      onLogout={onLogout}
      title="Create New Listing"
      subtitle="Add details about the food you want to share"
      location="Ikeja, Lagos"
    >
      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        {/* LEFT COLUMN */}
        <div className="order-2 lg:order-0">
          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-5 text-lg font-semibold text-ink">
              Listing Information
            </h2>

            <div className="space-y-5">
              {/* FOOD NAME */}
              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  1. Food Name{' '}
                  <span className="text-error">*</span>
                </label>

                <TextField
                  placeholder="Enter your food name"
                  required
                  variant="profile"
                  value={mealName}
                  onChange={(e) =>
                    setMealName(e.target.value)
                  }
                />

                <p className="mt-1 text-caption text-body-text">
                  Give your food a clear and appealing name.
                </p>
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  2. Category{' '}
                  <span className="text-error">*</span>
                </label>

                <select
                  required
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal"
                >
                  <option value="">
                    Select
                  </option>

                  {CATEGORY_OPTIONS.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>

                <p className="mt-1 text-caption text-body-text">
                  Choose the category that best fits your food.
                </p>
              </div>

              {/* PRICE */}
              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  3. Price{' '}
                  <span className="text-error">*</span>
                </label>

                <div className="flex items-center gap-4">
                  <TextField
                    type="number"
                    placeholder="Enter your price"
                    variant="profile"
                    value={price}
                    disabled={isFree}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                  />

                  <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-body-text">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => {
                        setIsFree(
                          e.target.checked
                        );

                        if (
                          e.target.checked
                        ) {
                          setPrice('');
                        }
                      }}
                      className="h-4 w-4 rounded border-border-muted text-green-normal focus:ring-green-normal"
                    />

                    This listing is free
                  </label>
                </div>

                <p className="mt-1 text-caption text-body-text">
                  Set a fair price or offer it for free.
                </p>
              </div>

              {/* QUANTITY */}
              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  4. Quantity{' '}
                  <span className="text-error">*</span>
                </label>

                <div className="flex items-center gap-3">
                  <div className="flex w-[70%] items-center gap-3 rounded-full border border-border-muted px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (q) =>
                            Number(q) + 1
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-normal text-white"
                    >
                      +
                    </button>

                    <span className="flex-1 text-center text-body1 font-medium text-ink">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          (q) =>
                            Math.max(
                              1,
                              Number(q) - 1
                            )
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-normal text-white"
                    >
                      −
                    </button>
                  </div>

                  <div className="flex w-full max-w-[30%] gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCategory(
                          'Cooked Meals'
                        )
                      }
                      className={`shrink-0 rounded-2xl border px-6 py-3 text-normal font-medium transition-colors ${
                        category ===
                        'Cooked Meals'
                          ? 'border-green-normal bg-green-light text-green-normal'
                          : 'border-border-muted text-body-text'
                      }`}
                    >
                      Meals
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCategory('Drinks')
                      }
                      className={`shrink-0 rounded-2xl border px-6 py-3 text-normal font-medium transition-colors ${
                        category ===
                        'Drinks'
                          ? 'border-green-normal bg-green-light text-green-normal'
                          : 'border-border-muted text-body-text'
                      }`}
                    >
                      Drinks
                    </button>
                  </div>
                </div>

                <p className="mt-1 text-caption text-body-text">
                  How many portions are available?
                </p>
              </div>

              {/* PICKUP LOCATION */}
              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  5. Pickup Location{' '}
                  <span className="text-error">*</span>
                </label>

                <div className="flex items-center gap-3 rounded-xl bg-green-light p-4">
                  <MapPin className="h-5 w-5 shrink-0 text-green-normal" />

                  <div className="flex-1">
                    <p className="font-medium text-ink">
                      {locationMode ===
                      'vendor'
                        ? vendorAddress ||
                          'Your business address would appear here'
                        : customAddress ||
                          'Select a location on the map'}
                    </p>

                    <p className="text-sm text-body-text">
                      This is where the user will pick up the food
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowLocationModal(
                        true
                      )
                    }
                    className="shrink-0 rounded-full border border-green-normal bg-white px-4 py-2 text-sm font-semibold text-green-normal transition-colors hover:bg-green-light"
                  >
                    Change Location
                  </button>
                </div>

                <p className="mt-1 text-caption text-body-text">
                  Ensure the location is accurate for smooth pickups
                </p>
              </div>

              {/* PICKUP DEADLINE */}
              <div>
                <label className="mb-1 block text-body1 font-semibold text-ink">
                  6. Pickup Deadline{' '}
                  <span className="text-error">*</span>
                </label>

                <div className="relative">
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => {
                      const selectedTime =
                        e.target.value;

                      setPickupTime(
                        selectedTime
                      );

                      if (!selectedTime)
                        return;

                      const [
                        hours,
                        minutes,
                      ] =
                        selectedTime
                          .split(':')
                          .map(Number);

                      const now =
                        new Date();

                      const expiry =
                        new Date();

                      expiry.setHours(
                        hours
                      );

                      expiry.setMinutes(
                        minutes
                      );

                      expiry.setSeconds(
                        0
                      );

                      expiry.setMilliseconds(
                        0
                      );

                      if (expiry <= now) {
                        expiry.setDate(
                          expiry.getDate() +
                            1
                        );
                      }

                      const duration =
                        Math.ceil(
                          (expiry - now) /
                            (1000 * 60)
                        );

                      setExpiryDuration(
                        duration
                      );
                    }}
                    className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal"
                  />
                </div>

                <p className="mt-1 text-caption text-body-text">
                  Listing would end at this time
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 rounded-xl border border-border-muted px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-secondary"
              >
                Cancel
              </button>

              <PrimaryButton
                type="submit"
                className="flex-1 rounded-2xl px-2 py-2"
                disabled={loading}
              >
                {loading
                  ? 'Publishing...'
                  : 'Publish Listing'}
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="order-1 space-y-6 lg:order-0">
          {/* FOOD IMAGE */}
          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-1 text-lg font-semibold text-ink">
              Food image{' '}
              <span className="text-error">*</span>
            </h2>

            <p className="mb-4 text-caption text-body-text">
              Add a clear photo of your food
            </p>

            {photoPreview.length <
              MAX_PHOTOS && (
              <div
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="cursor-pointer rounded-2xl border-2 border-dashed border-border-muted p-8 text-center transition-colors hover:bg-green-light/40"
              >
                <Upload className="mx-auto mb-3 h-8 w-8 text-body-text" />

                <p className="font-semibold text-ink">
                  Upload photos
                </p>

                <p className="mt-1 text-sm text-body-text">
                  or drag and drop
                </p>

                <p className="text-caption text-body-text">
                  PNG,JPG up to 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />

            {photoPreview.length >
              0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {photoPreview.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      key={index}
                      className="relative h-30 w-30 shrink-0 overflow-hidden rounded-xl"
                    >
                      <img
                        src={preview}
                        alt={`Listing photo ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removePhoto(
                            index
                          )
                        }
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-normal text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="rounded-2xl border border-border-fade bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold text-ink">
              Description{' '}
              <span className="text-error">*</span>
            </h2>

            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Provide a short description of your food"
              className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-body-text placeholder:text-body-text focus:outline-none focus:ring-2 focus:ring-green-normal"
            />
          </div>
        </div>
      </form>

      {/* CHANGE LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  Change pickup location
                </h3>

                <p className="text-sm text-body-text">
                  Choose where users should pick up this listing.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowLocationModal(
                    false
                  )
                }
                className="text-body-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* BUSINESS LOCATION */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                  locationMode ===
                  'vendor'
                    ? 'border-green-normal bg-green-light'
                    : 'border-border-muted'
                }`}
              >
                <input
                  type="radio"
                  name="locationMode"
                  checked={
                    locationMode ===
                    'vendor'
                  }
                  onChange={() =>
                    setLocationMode(
                      'vendor'
                    )
                  }
                  className="mt-1 h-4 w-4 text-green-normal focus:ring-green-normal"
                />

                <div>
                  <p className="font-medium text-ink">
                    Use Business Address
                  </p>

                  <p className="text-sm text-body-text">
                    {vendorAddress ||
                      'Loading your business address…'}
                  </p>
                </div>
              </label>

              {/* CUSTOM LOCATION */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                  locationMode ===
                  'custom'
                    ? 'border-green-normal bg-green-light'
                    : 'border-border-muted'
                }`}
              >
                <input
                  type="radio"
                  name="locationMode"
                  checked={
                    locationMode ===
                    'custom'
                  }
                  onChange={() =>
                    setLocationMode(
                      'custom'
                    )
                  }
                  className="mt-1 h-4 w-4 text-green-normal focus:ring-green-normal"
                />

                <div>
                  <p className="font-medium text-ink">
                    Choose Another Pickup Location
                  </p>

                  <p className="text-sm text-body-text">
                    Select the exact pickup point on the map.
                  </p>
                </div>
              </label>
            </div>

            {/* CUSTOM LOCATION */}
            {locationMode === 'custom' && (
              <div className="mt-4 border-t border-border-muted pt-4">
            
                {/* MANUAL ADDRESS */}
                <div className="space-y-3">
            
                  <p className="text-sm font-medium text-ink">
                    Enter pickup address
                  </p>
            
                  <TextField
                    placeholder="Street address"
                    variant="profile"
                    value={customStreet}
                    onChange={(e) =>
                      setCustomStreet(e.target.value)
                    }
                  />
            
                  <TextField
                    placeholder="City"
                    variant="profile"
                    value={customCity}
                    onChange={(e) =>
                      setCustomCity(e.target.value)
                    }
                  />
            
                  <TextField
                    placeholder="State"
                    variant="profile"
                    value={customState}
                    onChange={(e) =>
                      setCustomState(e.target.value)
                    }
                  />
            
                  <button
                    type="button"
                    onClick={handleAddressChange}
                    className="w-full rounded-xl border border-green-normal bg-white px-4 py-3 text-sm font-semibold text-green-normal hover:bg-green-light"
                  >
                    Find Location From Address
                  </button>
            
                </div>
            
                {/* MAP */}
                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium text-ink">
                    Or select the exact pickup point on the map
                  </p>
                
                  <LocationPicker
                    key={`${customLatitude}-${customLongitude}`}
                    initialPosition={
                      customLatitude !== null &&
                      customLongitude !== null
                        ? {
                            latitude: customLatitude,
                            longitude: customLongitude,
                          }
                        : null
                    }
                    onSelect={handleMapLocationSelect}
                  />
                </div>
            
                {/* COORDINATES */}
                {customLatitude !== null &&
                  customLongitude !== null && (
                    <div className="mt-3 rounded-xl bg-green-light p-3 text-sm text-ink">
                      <p className="font-semibold">
                        Pickup location confirmed
                      </p>
            
                      <p>
                        Latitude: {customLatitude}
                      </p>
            
                      <p>
                        Longitude: {customLongitude}
                      </p>
            
                      {customAddress && (
                        <p className="mt-1">
                          Address: {customAddress}
                        </p>
                      )}
                    </div>
                  )}
              </div>
            )}

            <PrimaryButton
              type="button"
              className="mt-6 w-full rounded-2xl px-2 py-2"
              onClick={() => {
                if (
                  locationMode ===
                    'custom' &&
                  (customLatitude ===
                    null ||
                    customLongitude ===
                      null)
                ) {
                  notify.error(
                    'Please select a location on the map.'
                  );

                  return;
                }

                setShowLocationModal(
                  false
                );
              }}
            >
              Save Location
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
              <CheckCircle2 className="h-9 w-9 text-green-normal" />
            </div>

            <h3 className="text-xl font-bold text-ink">
              Listing Published
            </h3>

            <p className="mt-2 text-body2 text-body-text">
              Your surplus food listing is now live and visible to nearby users.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setShowSuccess(
                    false
                  )
                }
                className="flex-1 rounded-xl border border-border-muted px-4 py-3 text-sm font-medium text-ink hover:bg-surface-secondary transition-colors"
              >
                Create Another
              </button>

              <PrimaryButton
                className="flex-1 rounded-2xl py-2 px-2"
                onClick={
                  handleViewListings
                }
              >
                View Listings
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
