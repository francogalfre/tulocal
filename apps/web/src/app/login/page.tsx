import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
