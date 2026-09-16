"use client";

import { useState } from "react";

import { signInWithGoogle } from "@tulocal/authentication/client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const AFTER_SIGN_IN_PATH = "/new";

export function GoogleSignIn() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleClick(): void {
    setIsRedirecting(true);
    void signInWithGoogle(AFTER_SIGN_IN_PATH);
  }

  return (
    <Button size="lg" className="w-full" disabled={isRedirecting} onClick={handleClick}>
      {isRedirecting ? <Spinner data-icon="inline-start" /> : null}
      entrar con Google
    </Button>
  );
}
