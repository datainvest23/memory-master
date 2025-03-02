"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setLoading(true);

      console.log("Attempting login with:", { email });

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Login error:", authError);
        throw authError;
      }

      if (authData?.user) {
        console.log("User authenticated:", authData.user.id);
        
        // Fetch user's profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          console.log("Full error details:", JSON.stringify(profileError, null, 2));
        } else if (profileData) {
          console.log("Profile data fetched:", profileData);
          // Store first_name in localStorage for easy access
          localStorage.setItem('userFirstName', profileData.first_name);
        } else {
          console.log("No profile found for user");
        }

        console.log("Login successful, redirecting...");
        router.refresh();
        router.push("/mood-selection");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Ein Fehler ist aufgetreten. Bitte versuche es erneut."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <Image
            src="/logo.svg"
            alt="Memory Master Logo"
            width={90}
            height={90}
            priority
            className={styles.logo}
          />
        </div>

        <h1 className={styles.title}>Willkommen bei Memory Master</h1>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-Mail</label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="Deine E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Passwort</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type="password"
                placeholder="Dein Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
            disabled={loading}
          >
            {loading ? "Anmeldung..." : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
} 