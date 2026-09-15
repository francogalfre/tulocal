import { LoginScreen } from "@/app/login/login-screen";

export const metadata = { title: "entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginScreen googleFailed={error !== undefined} />;
}
