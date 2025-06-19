import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  isListingFavorited,
} from "./favorites.api";

export const useFavorites = (page = 1, limit = 12) =>
  useQuery({
    queryKey: ["favorites", page],
    queryFn: () => getFavorites(page, limit),
  });

export const useIsFavorite = (listingId: string, enabled = true) =>
  useQuery({
    queryKey: ["favorites", "check", listingId],
    queryFn: () => isListingFavorited(listingId),
    enabled,
  });

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};
