import { LoginButton } from "@/components/auth/FirebaseAuthProvider";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Inicia sesión para acceder</h1>
      <LoginButton />
    </div>
  );
}
