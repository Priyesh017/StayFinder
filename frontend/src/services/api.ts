const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Something went wrong");
    }

    return response.json();
  }

  // Auth endpoints
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    register: (userData: any) =>
      this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    verifyToken: (token: string) =>
      this.request("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      }),
  };

  // Property endpoints
  properties = {
    getAll: (filters?: any) => {
      const queryParams = filters ? `?${new URLSearchParams(filters)}` : "";
      return this.request(`/properties${queryParams}`);
    },

    getById: (id: string) => this.request(`/properties/${id}`),

    create: (propertyData: any) =>
      this.request("/properties", {
        method: "POST",
        body: JSON.stringify(propertyData),
      }),

    update: (id: string, propertyData: any) =>
      this.request(`/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(propertyData),
      }),

    delete: (id: string) =>
      this.request(`/properties/${id}`, {
        method: "DELETE",
      }),

    search: (searchParams: any) =>
      this.request("/properties/search", {
        method: "POST",
        body: JSON.stringify(searchParams),
      }),
  };

  // Booking endpoints
  bookings = {
    create: (bookingData: any) =>
      this.request("/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      }),

    getUserBookings: () => this.request("/bookings/user"),

    getHostBookings: () => this.request("/bookings/host"),

    updateStatus: (id: string, status: string) =>
      this.request(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  };

  // Review endpoints
  reviews = {
    create: (reviewData: any) =>
      this.request("/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData),
      }),

    getByProperty: (propertyId: string) =>
      this.request(`/properties/${propertyId}/reviews`),
  };
}

export const api = new ApiService();
export const {
  auth: authAPI,
  properties: propertiesAPI,
  bookings: bookingsAPI,
  reviews: reviewsAPI,
} = api;
