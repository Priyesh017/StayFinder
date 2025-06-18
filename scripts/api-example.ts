// StayFinder API Examples
// This demonstrates the backend API endpoints that would be implemented

const API_BASE_URL = "http://localhost:5000/api";

// Authentication endpoints
async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response.json();
}

async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  return response.json();
}

// Property endpoints
async function getAllProperties(filters = {}) {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/properties?${queryParams}`);
  return response.json();
}

async function getPropertyById(id) {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  return response.json();
}

async function createProperty(propertyData, token) {
  const response = await fetch(`${API_BASE_URL}/properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(propertyData),
  });
  return response.json();
}

async function updateProperty(id, propertyData, token) {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(propertyData),
  });
  return response.json();
}

async function deleteProperty(id, token) {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

// Booking endpoints
async function createBooking(bookingData, token) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });
  return response.json();
}

async function getUserBookings(token) {
  const response = await fetch(`${API_BASE_URL}/bookings/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

async function getHostBookings(token) {
  const response = await fetch(`${API_BASE_URL}/bookings/host`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

async function updateBookingStatus(id, status, token) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
}

// Search endpoint with filters
async function searchProperties(searchParams) {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchParams),
  });
  return response.json();
}

// Reviews endpoints
async function createReview(reviewData, token) {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });
  return response.json();
}

async function getPropertyReviews(propertyId) {
  const response = await fetch(
    `${API_BASE_URL}/properties/${propertyId}/reviews`
  );
  return response.json();
}

// Example usage
console.log("StayFinder API Examples loaded");

// Example: Register a new user
const newUser = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@email.com",
  password: "securePassword123",
  userType: "guest",
};

// Example: Search properties
const searchCriteria = {
  location: "New York",
  checkIn: "2024-04-01",
  checkOut: "2024-04-05",
  guests: 2,
  minPrice: 100,
  maxPrice: 300,
  propertyType: "apartment",
};

// Example: Create a booking
const bookingData = {
  propertyId: 1,
  checkInDate: "2024-04-01",
  checkOutDate: "2024-04-05",
  numGuests: 2,
  specialRequests: "Late check-in requested",
};

// These functions would be called from your React components
// with proper error handling and loading states
