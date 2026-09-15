"use client";

import { Button } from "@tulocal/ui/components/button";
import { Spinner } from "@tulocal/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { GoogleMark } from "@/app/login/google-mark";
import { Screen } from "@/components/screen";
import { getAppUrl } from "@/lib/app-url";
import { authClient } from "@/lib/auth-client";

const GOOGLE_FAILED_MESSAGE = "no pudimos entrar con Google. probá de nuevo.";

export function LoginScreen({ googleFailed }: { googleFailed: boolean }) {
  const router = useRouter();
  const session = authClient.useSession();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(googleFailed);

  useEffect(() => {
    if (session.data) router.replace("/onboarding");
  }, [session.data, router]);

  async function signInWithGoogle() {
    setPending(true);
    setFailed(false);
    const appUrl = getAppUrl();
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${appUrl}/onboarding`,
      errorCallbackURL: `${appUrl}/login?error=google`,
    });
    if (result.error) {
      setPending(false);
      setFailed(true);
    }
  }

  return (
    <Screen>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-title">tu tienda, desde una foto.</h1>
          <p>
            le sacás fotos a lo que vendés, la IA arma la publicación y un vendedor tuyo atiende a
            los que preguntan.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full sm:w-[360px]"
            onClick={signInWithGoogle}
            disabled={pending}
          >
            {pending ? <Spinner /> : <GoogleMark />}
            seguir con Google
          </Button>
          {failed ? (
            <p role="alert" className="text-label text-warning-deep">
              {GOOGLE_FAILED_MESSAGE}
            </p>
          ) : (
            <p className="text-label text-muted-foreground">
              sin contraseña. entrás con tu cuenta de Google y listo.
            </p>
          )}
        </div>
      </div>
    </Screen>
  );
}
