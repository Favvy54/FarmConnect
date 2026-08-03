import { useState, useRef, useEffect } from 'react';
import { Camera, Upload} from 'lucide-react';
import TextField from '../components/TextField.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { createAppUserProfile } from '../services/auth.js';
import { uploadImageToCloudinary } from '../services/uploadImage.js';
import * as nigerianStates from 'nigerian-states-and-lgas';

const GENDERS = ['Male', 'Female', 'Prefer not to'];

const CATEGORY_OPTIONS = [
  'Rice Dishes',
  'Cooked Meals',
  'Pastries',
  'Bread',
  'Drinks',
  'Desserts',
  'Fast Food',
  'Snacks',
  'Grilled Food',
  'Seafood',
  'Vegetables',
  'Fruits',
  'Beverages',
  'Local Delicacies',
];

const STATES = nigerianStates.all().map((s) => s.state);

export default function UserProfileScreen({ onComplete }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState(null);

  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [lgasList, setLgasList] = useState([]);

  const [streetAddress, setStreetAddress] = useState('');
  const [preferredFoodCategories, setPreferredFoodCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Image upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Pull fullName/phone from the already-registered account 

 useEffect(() => {
   setFullName(sessionStorage.getItem('farmconnect_signup_fullName') || '');
   setPhone(sessionStorage.getItem('farmconnect_signup_phone') || '');
 }, []);

  const handleStateChange = (e) => {
    const selectedState = e.target.value;

    setState(selectedState);
    setCity('');

    const foundState = nigerianStates
      .all()
      .find((s) => s.state === selectedState);

    setLgasList(foundState ? foundState.lgas : []);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleCategory = (category) => {
    setPreferredFoodCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const validateForm = () => {
    if (!gender) return 'Please select a gender.';
    if (!dateOfBirth) return 'Date of birth is required.';
    if (!state) return 'Please select a state.';
    if (!city) return 'Please select a city.';
    if (!streetAddress.trim()) return 'Street address is required.';
    if (preferredFoodCategories.length === 0)
      return 'Please select at least one preferred food category.';
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

      await createAppUserProfile({
        fullName,
        phone,
        profileImage: profileImageUrl,
        gender: gender.toLowerCase(),
        dateOfBirth,
        address: streetAddress,
        city,
        state,
        preferredFoodCategories,
        bio: '',
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
      <div className="space-y-6">
        <div>
          <h1 className="text-h2 font-bold text-ink">
            Complete your user profile
          </h1>
          <p className="mt-2 text-body1 text-body-text">
            This helps us to personalize your experience
          </p>
        </div>

        {error && <p className="text-body2 text-red-500">{error}</p>}

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Date Of Birth
          </label>
          <input
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal"
          />
        </div>

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Gender
          </label>
          <div className="flex flex-wrap gap-3">
            {GENDERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGender(option)}
                className={`rounded-xl border px-5 py-3 text-body1 transition-colors ${
                  gender === option
                    ? 'border-green-normal bg-green-light text-ink'
                    : 'border-border-muted text-body-text'
                }`}>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* State */}
          <div>
            <label className="mb-2 block text-body1 font-bold text-ink">
              State
            </label>

            <select
              required
              value={state}
              onChange={handleStateChange}
              className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink focus:outline-none focus:ring-2 focus:ring-green-normal">
              <option value="">Select State</option>

              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* City / LGA */}
          <div>
            <label className="mb-2 block text-body1 font-bold text-ink">
              City
            </label>

            <select
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!state}
              className="w-full rounded-xl border border-border-muted px-4 py-3 text-body1 text-ink disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-normal">
              <option value="">
                {state ? 'Select LGA' : 'Select State First'}
              </option>

              {lgasList.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Street Address
          </label>

          <TextField
            placeholder="Street Address"
            required
            variant="profile"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-body1 font-bold text-ink">
            Preferred Food Category
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`rounded-xl border px-4 py-3 text-center text-sm font-medium transition-colors ${
                  preferredFoodCategories.includes(category)
                    ? 'border-green-normal bg-green-light text-green-normal'
                    : 'border-border-muted text-body-text'
                }`}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="self-center justify-self-center">
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

          <h2 className="text-h3 font-bold text-ink mt-6">
            Add a profile photo
          </h2>

          <p className="text-body1 text-ink mt-2 max-w-sm">
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
            className="mt-6 flex items-center gap-2 rounded-xl border-2 border-green-normal bg-white text-green-normal px-6 py-3 font-medium">
            <Upload className="w-4 h-4" />
            {photoFile ? photoFile.name : 'Upload Photo'}
          </button>
        </div>

        <PrimaryButton type="submit" disabled={loading} className="mt-6 rounded-2xl py-3 px-2 w-full text-regular">
          {loading ? 'Saving...' : 'Complete Profile'}
        </PrimaryButton>
      </div>
    </form>
  );
}