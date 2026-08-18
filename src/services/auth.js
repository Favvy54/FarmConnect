const BASE_URL = 'https://farmconnect-backend-1.onrender.com/api/v1';
const PROFILE_URL = 'https://farmconnect-backend-1.onrender.com/api';
const TOKEN_KEY = 'farmconnect_token';
const ROLE_KEY = 'farmconnect_role';
const EMAIL_KEY = 'farmconnect_email';

export function saveSession({ token, role, email }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  }

  if (email) {
    localStorage.setItem(EMAIL_KEY, email);
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function getEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

async function apiRequest(path, { method = 'POST', body, auth = false } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request to ${path} failed`);
  }

  return data;
}

// Vendor resquest

async function profileRequest(
  path,
  { method = 'POST', body, auth = false } = {},
) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${PROFILE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request to ${path} failed`);
  }

  return data;
}

// Authentication

// Register
export async function register(userData) {
  return apiRequest('/auth/register', {
    body: userData,
  });
}

// Login
export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    body: {
      email,
      password,
    },
  });

  saveSession({
    token: data.data.token,
    role: data.data.user?.role,
    email: data.data.user?.email,
  });

  return data.data;
}

// Forgot Password
export async function forgotPassword(email) {
  const data = await apiRequest('/auth/forgot-password', {
    body: { email },
  });

  

  // Save email for the reset flow
  localStorage.setItem('resetEmail', email);

  return data;
}

// Verify Email

// Verify OTP
export async function verifyOtp(email, otp) {
  return apiRequest('/auth/verify-otp', {
    body: {
      email,
      otp,
    },
  });
}

// Reset Password
export async function resetPassword(newPassword, confirmPassword) {
  const email = localStorage.getItem('resetEmail');

  if (!email) {
    throw new Error('Reset email not found. Please request a new OTP.');
  }

  const data = await apiRequest('/auth/reset-password', {
    body: {
      email,
      newPassword,
      confirmPassword,
    },
  });

  localStorage.removeItem('resetEmail');

  return data;
}

export const getCurrentUser = async () => {
  const token = getToken();

  const response = await fetch(
    "https://farmconnect-backend-1.onrender.com/api/v1/auth/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.data;
};

export const getMyListings = async (search = "") => {
  const token = getToken();

  const url = new URL(
    "https://farmconnect-backend-1.onrender.com/api/listings/my-listings"
  );

  if (search.trim()) {
    url.searchParams.append("search", search);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.data;
};
// Logout
export async function logout() {
  try {
    await apiRequest('/auth/logout', {
      auth: true,
    });
  } finally {
    clearSession();
  }
}

// Vendor Profile

// Create Vendor Profile
export async function createVendorProfile(payload) {
  return profileRequest('/vendors/profile', {
    body: payload,
    auth: true,
  });
}

// Get Vendor Profile
export async function getVendorProfile() {
  return profileRequest('/vendors/profile', {
    method: 'GET',
    auth: true,
  });
}

// Update Vendor Profile
export async function updateVendorProfile(payload) {
  return profileRequest('/vendors/profile', {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}
export async function updateVendorLocation(
  longitude,
  latitude
) {
  return profileRequest("/vendors/location", {
    method: "PATCH",
    auth: true,
    body: {
      longitude,
      latitude,
    },
  });
}


export async function updateCurrentVendorLocation() {

  if (!("geolocation" in navigator)) {
    throw new Error(
      "Geolocation is not supported by this browser."
    );
  }

  const position = await new Promise(
    (resolve, reject) => {

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

    }
  );

  const {
    longitude,
    latitude
  } = position.coords;

  return updateVendorLocation(
    longitude,
    latitude
  );
}



export async function getLocationFromCoordinates(
  longitude,
  latitude
) {
  const params = new URLSearchParams({
    longitude: String(longitude),
    latitude: String(latitude),
  });

  const res = await apiRequest(
    `/location/reverse?latitude=${latitude}&longitude=${longitude}`,
    {
      method: 'GET',
      auth: true,
    }
  );

  return res?.data;
}

export async function getCoordinatesFromLocation(
  city,
  state
) {
  const params = new URLSearchParams({
    city,
    state,
  });

  const res = await apiRequest(
    `/location/search?${params.toString()}`,
    {
      method: 'GET',
      auth: true,
    }
  );

  return res?.data;
}


// Delete Vendor Profile
export async function deleteVendorProfile() {
  return profileRequest('/vendors/profile', {
    method: 'DELETE',
    auth: true,
  });
}


// LISTINGS

// Create Listing
export async function createListing(payload) {
  return profileRequest('/listings/', {
    body: payload,
    auth: true,
  });
};

// Update Listing
export async function updateListing(listingId, payload) {
  return profileRequest(`/listings/${listingId}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

// Delete Listing
export async function deleteListing(listingId) {
  return profileRequest(`/listings/${listingId}`, {
    method: 'DELETE',
    auth: true,
  });
}

// Categories
export async function getCategories() {
  return profileRequest('/listings/categories', {
    method: 'GET',
  });
}

// Analytics

export async function getDashboardAnalytics() {
  return profileRequest("/analytics/dashboard", {
    method: "GET",
    auth: true,
  });
}


// Reservation (Vendor)

export async function getVendorReservations() {
  return profileRequest("/reservations/vendor", {
    method: "GET",
    auth: true,
  });
}

export async function getVendorReservationHistory() {
  const res = await profileRequest('/reservations/vendor/history', {
    method: 'GET',
    auth: true,
  });
  return res?.data?.reservations || res?.data || [];
}

export async function completeReservation(reservationId) {
  return profileRequest(`/reservations/${reservationId}/complete`, {
    method: 'PATCH',
    auth: true,
  });
}

export async function cancelVendorReservation(reservationId, cancellationReason) {
  return profileRequest(`/reservations/${reservationId}/cancel`, {
    method: 'PATCH',
    auth: true,
    body: { cancellationReason },
  });
}


// User Flow


// App User Profile

export async function createAppUserProfile(payload) {
  return profileRequest('/user/profile', {
    body: payload,
    auth: true,
  });
}

export async function getAppUserProfile() {
  return profileRequest('/user/profile', {
    method: 'GET',
    auth: true,
  });
}

export async function updateAppUserProfile(payload) {
  return profileRequest('/user/profile', {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAppUserProfile() {
  return profileRequest('/user/profile', {
    method: 'DELETE',
    auth: true,
  });
}



// Browse all listings (market feed) — for the user-facing dashboard
export async function getAllListings(search = "") {

  const query = search
      ? `?search=${encodeURIComponent(search)}`
      : "";

  const res = await profileRequest(
      `/listings/market-list${query}`,
      {
          method: "GET",
          auth: true,
      }
  );

  return res?.data || [];
}

export async function getNearbyListings(
  longitude,
  latitude,
  maxDistance = 30000
) {
  let url = '/listings/nearby';

  if (
    longitude !== undefined &&
    latitude !== undefined
  ) {
    const query = new URLSearchParams({
      longitude: String(longitude),
      latitude: String(latitude),
      maxDistance: String(maxDistance),
    });

    url += `?${query.toString()}`;
  }

  const res = await profileRequest(url, {
    method: 'GET',
    auth: true,
  });

  return res?.data || [];
};

export async function updateAppUserLocation(
  longitude,
  latitude
) {
  const res = await profileRequest(
    '/user/profile/location',
    {
      method: 'PATCH',
      auth: true,
      body: {
        longitude,
        latitude,
      },
    }
  );

  return res?.data;
};

// Reservation User


export async function createReservation({ listingId, quantityRequested }) {
  return profileRequest('/reservations', {
    method: 'POST',
    auth: true,
    body: { listingId, quantityRequested },
  });
}

export async function getCurrentReservations() {
  const res = await profileRequest('/reservations/my-reservations', {
    method: 'GET',
    auth: true,
  });

  const reservations = res?.data?.reservations || res?.data || [];
  return reservations.filter((r) => {
    if (r.status !== 'reserved') return false;
    if (!r.reservedAt) return false;
    const deadline = new Date(new Date(r.reservedAt).getTime() + 60 * 60000);
    return deadline > new Date();
  });
}

export async function getReservationHistory() {
  const res = await profileRequest('/reservations/my-history', {
    method: 'GET',
    auth: true,
  });
  return res?.data?.reservations || res?.data || [];
}

export async function getUserDashboardAnalytics() {
  const res = await profileRequest('/analytics/user-dashboard', {
    method: 'GET',
    auth: true,
  });

  return res?.data || {};
}

export async function cancelReservation(reservationId) {
  return profileRequest(`/reservations/${reservationId}/user-cancel`, {
    method: 'PATCH',
    auth: true,
  });
}

export const askMiniFarmBot = async (message) => {
  return profileRequest('/mini-farm-bot/chat', {
    method: 'POST',
    body: { message },
    auth: true,
  });
};

export const getListingDetails = async (listingId) => {
  return profileRequest(`/listings/${listingId}/details`, {
    method: 'GET',
    auth: true,
  });
};

export const getVendorReservationAnalytics = async () => {
  return profileRequest(
    "/vendors/vendor/analytics",
    {
      method: "GET",
      auth: true,
    }
  );
};
