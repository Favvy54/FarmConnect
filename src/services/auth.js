export async function register(userData) {
  const response = await fetch(
    'https://farmconnect-backend-1.onrender.com/api/v1/auth/register',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
}

// Login Fuction

export async function login(email, password) {
  const response = await fetch(
    'https://farmconnect-backend-1.onrender.com/api/v1/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data.data;
}

// Forgot Passsword

export async function forgotPassword(email) {
  const response = await fetch(
    'https://farmconnect-backend-1.onrender.com/api/v1/auth/forgot-password',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }

  return data;
}

// Verify Email

export async function verifyOtp(email, otp) {
  const response = await fetch(
    'https://farmconnect-backend-1.onrender.com/api/v1/auth/verify-otp',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Invalid OTP');
  }

  return data;
}

// Updating Password

export async function resetPassword(newPassword, confirmPassword) {
  const response = await fetch(
    'https://farmconnect-backend-1.onrender.com/api/v1/auth/reset-password',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newPassword,
        confirmPassword,
      }),
    },
  );

    newPassword,

    confirmPassword

) {

    const email =
        localStorage.getItem(
            "resetEmail"
        );

    const response = await fetch(

        "https://farmconnect-backend-1.onrender.com/api/v1/auth/reset-password",

        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json",

            },

            body: JSON.stringify({

                email,

                newPassword,

                confirmPassword,

            }),

        }

    );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(

            data.message ||

            "Failed to reset password"

        );

    }

    // Reset complete
    localStorage.removeItem(
        "resetEmail"
    );

    return data;

}
