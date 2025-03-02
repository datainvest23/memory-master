"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./memory-prompt.module.css";

export default function MemoryPromptPage() {
  const router = useRouter();
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, [supabase.auth]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promptText.trim()) {
      setError("Bitte gib einen Text ein.");
      return;
    }

    if (!userId) {
      setError("Nicht eingeloggt. Bitte melde dich erneut an.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from("memory_prompts").insert([
        {
          user_id: userId,
          prompt_text: promptText.trim(),
        },
      ]);

      if (error) throw error;

      router.push("/evening-recall");
    } catch (err) {
      console.error("Error saving prompt:", err);
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Morgendliche Erinnerung</h1>
        <p className={styles.subtitle}>
          Gib drei Wörter oder einen kurzen Satz ein, die du dir für heute Abend merken möchtest
        </p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="z.B.: Blauer Himmel, sanfte Brise"
              className={styles.input}
              disabled={loading}
              maxLength={100}
              required
            />
            <div className={styles.charCount}>
              {promptText.length}/100 Zeichen
            </div>
          </div>

          <button
            type="submit"
            className={`${styles.button} ${loading ? styles.loading : ""}`}
            disabled={loading}
          >
            {loading ? "Speichern..." : "Speichern"}
          </button>
        </form>

        <p className={styles.hint}>
          Tipp: Wähle Wörter oder einen Satz, die für dich heute bedeutsam sind
        </p>
      </div>
    </div>
  );
}
