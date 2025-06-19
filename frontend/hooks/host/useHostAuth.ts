import { useMutation } from "@tanstack/react-query";
import {
  loginHost,
  registerHost,
  updateHostProfile,
  RegisterHostData,
} from "./host.api";
import { useHostStore } from "@/stores/host-store";
import type { Host } from "@/stores/host-store";

export function useHostLogin() {
  const setHost = useHostStore((s) => s.setHost);
  const setToken = useHostStore((s) => s.setToken);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginHost(email, password),
    onSuccess: ({ token, host }) => {
      setToken(token);
      setHost(host);
      localStorage.setItem("stayfinder_host_token", token);
    },
  });
}

export function useHostRegister() {
  const setHost = useHostStore((s) => s.setHost);
  const setToken = useHostStore((s) => s.setToken);

  return useMutation({
    mutationFn: (data: RegisterHostData) => registerHost(data),
    onSuccess: ({ token, host }) => {
      setToken(token);
      setHost(host);
      localStorage.setItem("stayfinder_host_token", token);
    },
  });
}

export function useHostUpdate() {
  const token = useHostStore((s) => s.token);
  const setHost = useHostStore((s) => s.setHost);

  return useMutation({
    mutationFn: (data: Partial<Host>) => {
      if (!token) throw new Error("No token found");
      return updateHostProfile(token, data);
    },
    onSuccess: (host) => {
      setHost(host);
    },
  });
}

export function useHostLogout() {
  const setHost = useHostStore((s) => s.setHost);
  const setToken = useHostStore((s) => s.setToken);

  return () => {
    localStorage.removeItem("stayfinder_host_token");
    setToken(null);
    setHost(null);
  };
}
