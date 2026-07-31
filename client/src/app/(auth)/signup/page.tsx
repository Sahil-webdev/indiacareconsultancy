"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { usePatientAuth } from "@/lib/patientAuth";

const AUTH_REDIRECT_KEY = "icc-patient-auth-redirect";

export default function SignupPage() {
  const router = useRouter();
  const { openAuthModal } = usePatientAuth();

  useEffect(() => {
    const redirectTarget =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirect") || "/"
        : "/";

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectTarget);
    }

    openAuthModal("signup");
    router.replace(redirectTarget);
  }, [openAuthModal, router]);

  return null;
}
