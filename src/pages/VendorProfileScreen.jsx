import { useState, useRef, useEffect } from 'react';
import { Camera, Upload } from 'lucide-react';
import TextField from '../components/TextField.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import {
  createVendorProfile,
  getEmail,
  getCurrentUser,
} from '../services/auth.js';

const BUSINESS_TYPES = ['Restaurant', 'Event Caterer', 'Bakery'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Cloudinary upload helper
const uploadImageToCloudinary = async (photoFile) => {
  const formData = new FormData();
  formData.append('file', photoFile);
  formData.append('upload_preset', 'FarmConnect_profile');

  const response = await fetch(
    'https://api.cloudinary.com/v1_1/cfjvajqm/image/upload',
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url;
};


export default function VendorProfileScreen({ onComplete }) {
  useEffect(() => {
    async function checkProfile() {
      try {
        const user = await getCurrentUser();
        if (user.profileCompleted) {
          onComplete?.();
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkProfile();
  }, [onComplete]);

  // Main form state
  const [businessType, setBusinessType] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [description, setDescription] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Address inputs
  const [currentAddressInput, setCurrentAddressInput] = useState('');
  const [permanentAddressInput, setPermanentAddressInput] = useState('');

  // Image upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    if (!businessName.trim()) return 'Business name is required.';
    if (!businessType) return 'Please select a business type.';
    if (!businessPhone.trim()) return 'Business phone is required.';
    if (!currentAddressInput.trim()) return 'Current address is required.';
    if (!permanentAddressInput.trim()) return 'Permanent address is required.';
    if (!description.trim()) return 'Business description is required.';
    if (!openTime || !closeTime) return 'Please select your operating hours.';
    if (selectedDays.length === 0)
      return 'Please select at least one operating day.';
    if (!photoFile) return 'Please upload a profile photo.';

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let profileImageUrl = 'https://placehold.co';

      if (photoFile) {
        profileImageUrl = await uploadImageToCloudinary(photoFile);
      }

      // Backend expects these exact field names
      const currentLocation = currentAddressInput.trim();
      const permanentAddress = permanentAddressInput.trim();

      await createVendorProfile({
        businessName,
        businessType,
        email: getEmail(),
        phone: businessPhone,
        description,
        permanentAddress,
        currentLocation,
        profileImage: profileImageUrl,
        operatingHours: `${openTime} - ${closeTime}`,
      });

      onComplete?.();
    } catch (err) {
      setError(err.message || 'Something went wrong creating your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid px-8 py-6 gap-12 md:grid-cols-2">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        <div>
          <h1 className="text-h2 font-bold text-ink">
            Complete your vendor profile
          </h1>

          <p className="mt-2 text-body1 text-body-text">
            This helps us personalize your experience
          </p>
        </div>

        {error && <p className="text-body2 text-red-500">{error}</p>}

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Business Name
          </label>

          <TextField
            placeholder="Business Name"
            required
            variant="profile"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-body1 font-bold text-ink mb-2">
            Business Type
          </label>

          <div className="flex flex-wrap gap-3">
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setBusinessType(type)}
                className={`rounded-xl border px-5 py-3 text-body1 transition-colors ${
                  businessType === type
                    ? 'border-green-normal bg-green-light text-ink'
                    : 'border-border-muted text-body-text'
                }`}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Current Address
          </label>

          <TextField
            placeholder="Current Address"
            required
            variant="profile"
            value={currentAddressInput}
            onChange={(e) => setCurrentAddressInput(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Permanent Address
          </label>

          <TextField
            placeholder="Permanent Address"
            required
            variant="profile"
            value={permanentAddressInput}
            onChange={(e) => setPermanentAddressInput(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Business Phone Number
          </label>

          <TextField
            placeholder="Business Phone Number"
            type="tel"
            required
            variant="profile"
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Operating Hours
          </label>

          <div className="grid grid-cols-2 gap-4">
            <select
              required
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full rounded-xl border border-border-muted px-4 py-3">
              <option value="">Open at</option>

              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                  {String(h).padStart(2, '0')}:00
                </option>
              ))}
            </select>

            <select
              required
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full rounded-xl border border-border-muted px-4 py-3">
              <option value="">Close at</option>

              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                  {String(h).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          {DAYS.map((day) => (
            <label
              key={day}
              className="flex items-center gap-2 text-body1 text-ink">
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() =>
                  setSelectedDays((prev) =>
                    prev.includes(day)
                      ? prev.filter((d) => d !== day)
                      : [...prev, day],
                  )
                }
              />

              {day}
            </label>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-8">
        <div className="rounded-3xl bg-green-light p-10 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src="/img-placeholder.png" alt="Profile placeholder" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-8 right-5 w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center">
              <Camera className="w-4 h-4 text-green-normal" />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-ink mt-6">
            Add a profile photo
          </h2>

          <p className="text-regular text-ink mt-2 max-w-sm">
            Adding a photo helps build trust in the community and makes your
            experience more personal
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 flex items-center gap-2 rounded-xl border-2 border-green-normal bg-white text-green-normal px-6 py-3 text-body1 font-medium">
            <Upload className="w-4 h-4" />
            {photoFile ? photoFile.name : 'Upload Photo'}
          </button>
        </div>

        <div className="mt-8 mb-8">
          <label className="block text-body1 font-bold text-ink mb-2">
            Description
          </label>

          <textarea
            placeholder="Enter a description that truly describes your business"
            rows={6}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border-muted px-4 py-4 text-body1 text-body-text placeholder:text-body-text focus:outline-none focus:ring-2 focus:ring-green-normal"
          />
        </div>

        <PrimaryButton disabled={loading} type="submit">
          {loading ? 'Saving...' : 'Complete Profile'}
        </PrimaryButton>
      </div>
    </form>
  );
}
