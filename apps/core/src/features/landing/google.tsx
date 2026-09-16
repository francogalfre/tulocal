"use client";

import { useState } from "react";

import { signInWithGoogle } from "@tulocal/authentication/client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const AFTER_SIGN_IN_PATH = "/new";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function GoogleSignIn() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleClick(): void {
    setIsRedirecting(true);
    void signInWithGoogle(AFTER_SIGN_IN_PATH);
  }

  return (
    <Button size="xl" className="w-full" disabled={isRedirecting} onClick={handleClick}>
      {isRedirecting ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <GoogleMark data-icon="inline-start" />
      )}
      Entrar con Google
    </Button>
  );
}
