import axios from "@/lib/axios";

// Add to favorites
export const addToFavorites = async (listingId: string) => {
  const res = await axios.post(`/favorites/${listingId}`);
  return res.data.data;
};

// Remove from favorites
export const removeFromFavorites = async (listingId: string) => {
  const res = await axios.delete(`/favorites/${listingId}`);
  return res.data;
};

// Get all favorites (paginated)
export const getFavorites = async (page = 1, limit = 12) => {
  const res = await axios.get(`/favorites?page=${page}&limit=${limit}`);
  return res.data;
};

// Check if a listing is favorited
export const isListingFavorited = async (listingId: string) => {
  const res = await axios.get(`/favorites/check/${listingId}`);
  return res.data.data.isFavorited;
};
