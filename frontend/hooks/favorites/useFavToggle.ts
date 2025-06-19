import {
  useAddToFavorites,
  useRemoveFromFavorites,
  useIsFavorite,
} from "./useFavourite";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/auth/useAuth";

export const useFavoriteToggle = (listingId: string) => {
  const { toast } = useToast();
  const { data: user } = useCurrentUser();
  const { data: isFavorite, refetch } = useIsFavorite(listingId, !!user);
  const add = useAddToFavorites();
  const remove = useRemoveFromFavorites();

  const toggleFavorite = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      remove.mutate(listingId, {
        onSuccess: () => {
          toast({
            title: "Removed from favorites",
            description: "Property removed from your favorites",
          });
          refetch();
        },
      });
    } else {
      add.mutate(listingId, {
        onSuccess: () => {
          toast({
            title: "Added to favorites",
            description: "Property saved to your favorites",
          });
          refetch();
        },
      });
    }
  };

  return {
    isFavorite,
    toggleFavorite,
    isLoading: add.isPending || remove.isPending,
  };
};
