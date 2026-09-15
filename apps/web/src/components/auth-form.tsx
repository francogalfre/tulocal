"use client";

import { Button } from "@tulocal/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tulocal/ui/components/card";
import { Input } from "@tulocal/ui/components/input";
import { Label } from "@tulocal/ui/components/label";
import { Separator } from "@tulocal/ui/components/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { GoogleIcon } from "./google-icon";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");
    setPending(true);
    const result = isSignup
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) {
      toast.error(result.error.message ?? "No pudimos ingresar. Probá de nuevo.");
      return;
    }
    router.push("/dashboard");
  }

  async function onGoogleSignIn() {
    setGooglePending(true);
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (result.error) {
      setGooglePending(false);
      toast.error(result.error.message ?? "No pudimos conectar con Google. Probá de nuevo.");
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isSignup ? "Creá tu cuenta" : "Ingresá"}</CardTitle>
          <CardDescription>
            {isSignup ? "Un minuto y ya tenés tu tienda." : "Bienvenido de vuelta."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={googlePending}
              onClick={onGoogleSignIn}
            >
              <GoogleIcon className="size-4" data-icon="inline-start" />
              {googlePending ? "Conectando…" : "Continuar con Google"}
            </Button>
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">o</span>
              <Separator className="flex-1" />
            </div>
          </div>
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
            {isSignup && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Un momento…" : isSignup ? "Crear cuenta" : "Ingresar"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {isSignup ? (
                <>
                  ¿Ya tenés cuenta?{" "}
                  <Link href="/login" className="underline">
                    Ingresá
                  </Link>
                </>
              ) : (
                <>
                  ¿No tenés cuenta?{" "}
                  <Link href="/signup" className="underline">
                    Creala
                  </Link>
                </>
              )}
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
