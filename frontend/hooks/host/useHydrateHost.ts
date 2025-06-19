import { useEffect } from "react";
import { useHostStore } from "@/stores/host-store";
import { fetchHost } from "./host.api";

export function useHydrateHost() {
  const setHost = useHostStore((s) => s.setHost);
  const setToken = useHostStore((s) => s.setToken);

  useEffect(() => {
    const token = localStorage.getItem("stayfinder_host_token");
    if (token) {
      fetchHost(token)
        .then((host) => {
          setToken(token);
          setHost(host);
        })
        .catch(() => {
          setToken(null);
          setHost(null);
          localStorage.removeItem("stayfinder_host_token");
        });
    }
  }, [setHost, setToken]);
}
