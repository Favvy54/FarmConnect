import { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import TextField from '../components/TextField.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { getEmail } from '../services/auth.js';
import * as nigerianStates from 'nigerian-states-and-lgas';

const GENDERS = ['Male', 'Female', 'Prefer not to'];

const STATES = nigerianStates.all().map((s) => s.state);

export default function UserProfileScreen({ onComplete }) {
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

  return (
    <form className="grid px-8 py-6 gap-12 md:grid-cols-2">
      <div className="space-y-6">
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
              City / LGA
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
      </div>

      {/* Right column */}
      <div className="space-y-8">
        <div className="rounded-3xl bg-green-light p-10 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full overflow-hidden">
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
            className="mt-6 flex items-center gap-2 rounded-xl border-2 border-green-normal bg-white text-green-normal px-6 py-3">
            <Upload className="w-4 h-4" />
            {photoFile ? photoFile.name : 'Upload Photo'}
          </button>
        </div>

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Complete Profile'}
        </PrimaryButton>
      </div>
    </form>
  );
}
