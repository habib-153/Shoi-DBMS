"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TherapistProfile() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified profile page
    router.replace("/profile");
  }, [router]);

  return null;
}
