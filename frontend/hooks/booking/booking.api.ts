import axios from "@/lib/axios";

export const createBooking = async (data: {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) => {
  const res = await axios.post("/booking", data);
  return res.data.data; // booking object
};

export const getUserBookings = async (page = 1, limit = 10) => {
  const res = await axios.get(
    `/booking/my-bookings?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const getHostBookings = async (page = 1, limit = 10) => {
  const res = await axios.get(
    `/booking/host/bookings?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const getBookingById = async (id: string) => {
  const res = await axios.get(`/booking/${id}`);
  return res.data.data;
};

export const cancelBooking = async (id: string) => {
  const res = await axios.patch(`/booking/${id}/cancel`);
  return res.data.data;
};
