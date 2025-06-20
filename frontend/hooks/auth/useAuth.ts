import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  updateProfile,
} from "@/hooks/auth/auth.api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/user";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "@/types/auth";

// Utility
const storeToken = (token: string) => localStorage.setItem("token", token);
const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("stayfinder_host_token");
};

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["auth", "user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

// Login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data.user);
      storeToken(data.token);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
      router.push("/");
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Register
export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data.user);
      storeToken(data.token);
      toast({
        title: "Account created",
        description: `Welcome, ${data.user.firstName}!`,
      });
      router.push("/");
    },
    onError: () => {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
};

// Update Profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["auth", "user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Something went wrong while updating profile.",
        variant: "destructive",
      });
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return () => {
    clearToken();
    queryClient.removeQueries({ queryKey: ["auth", "user"] });
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };
};
