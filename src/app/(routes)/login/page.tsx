"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    
    try {
      setError(null);
      setLoading(true);

      console.log("Attempting login with:", { email }); // Log login attempt

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error); // Log any errors
        throw error;
      }

      if (data?.user) {
        console.log("Login successful, redirecting..."); // Log successful login
        router.refresh(); // Refresh to update auth state
        router.push("/mood-selection");
      }
    } catch (err) {
      console.error("Login error:", err); // Log caught errors
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
        <h1 className={styles.title}>Willkommen zurück</h1>
        <p className={styles.subtitle}>Melde dich an, um deine Gedächtnisreise fortzusetzen</p>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-Mail</label>
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

          <div className={styles.inputGroup}>
            <label htmlFor="password">Passwort</label>
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
