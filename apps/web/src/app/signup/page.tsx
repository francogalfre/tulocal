import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
