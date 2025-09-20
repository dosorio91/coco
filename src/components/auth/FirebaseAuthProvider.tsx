"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const auth = getAuth(app);
const AuthContext = createContext<{ user: User | null, loading: boolean, login: () => void, logout: () => void }>({ user: null, loading: true, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        router.push("/"); // Redirige a inicio tras login
      }
    });
    return () => unsubscribe();
  }, [router]);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => router.push("/"));
  };

  const logout = () => {
    signOut(auth).then(() => router.push("/"));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  if (loading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  if (!user) return null;
  return <>{children}</>;
}

export function LoginButton() {
  const { login } = useAuth();
  return <button onClick={login} className="bg-[#4285F4] text-white px-4 py-2 rounded">Iniciar sesión con Google</button>;
}

export function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={logout} className="bg-gray-200 px-4 py-2 rounded">Cerrar sesión</button>;
}
