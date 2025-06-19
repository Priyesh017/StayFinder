// hooks/admin/useRequireAdmin.ts
import { useAdminUser } from "./useAdmin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAdmin() {
  const { data: admin, isLoading } = useAdminUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/admin/login");
    }
  }, [admin, isLoading, router]);

  return { admin, isLoading };
}
