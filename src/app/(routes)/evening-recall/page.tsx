"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./evening-recall.module.css";

interface PromptData {
  id: number;
  prompt_text: string;
  recalled_text?: string;
  recall_score?: number;
}

export default function EveningRecallPage() {
  const router = useRouter();
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [recallText, setRecallText] = useState("");
  const [resultMsg, setResultMsg] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user) {
          await fetchLatestPrompt(user.id);
        } else {
          throw new Error("Nicht eingeloggt");
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase.auth]);

  const fetchLatestPrompt = async (userId: string) => {
    const { data, error } = await supabase
      .from("memory_prompts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      setPromptData(data[0]);
    }
  };

  const handleRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promptData) return;
    
    try {
      setSubmitting(true);
      setError(null);

    const correct = promptData.prompt_text.trim().toLowerCase() === recallText.trim().toLowerCase();
      
      setResultMsg({
        text: correct 
          ? "Richtig! Gut gemacht! 🎉" 
          : `Leider falsch. Der richtige Text war: "${promptData.prompt_text}"`,
        isCorrect: correct
      });

      const { error } = await supabase
      .from("memory_prompts")
      .update({
          recalled_text: recallText.trim(),
        recall_score: correct ? 1 : 0,
        checked_at: new Date().toISOString(),
      })
      .eq("id", promptData.id);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating recall:", err);
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loader}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Ein Fehler ist aufgetreten</h1>
          <p className={styles.error}>{error}</p>
          <button 
            className={styles.button}
            onClick={() => router.push("/mood-selection")}
          >
            Zurück zum Start
          </button>
        </div>
      </div>
    );
  }

  if (!promptData) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Keine Erinnerung gefunden</h1>
          <p className={styles.subtitle}>
            Es wurde keine Erinnerung für heute gefunden. 
            Hast du heute Morgen eine Erinnerung eingetragen?
          </p>
          <button 
            className={styles.button}
            onClick={() => router.push("/memory-prompt")}
          >
            Neue Erinnerung erstellen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Abendliche Erinnerung</h1>
        <p className={styles.subtitle}>
          Versuche dich an die Wörter zu erinnern, die du heute Morgen eingegeben hast
        </p>

        {!resultMsg ? (
          <form onSubmit={handleRecall} className={styles.form}>
            <div className={styles.inputGroup}>
          <input
            type="text"
            value={recallText}
            onChange={(e) => setRecallText(e.target.value)}
                placeholder="Deine Erinnerung..."
                className={styles.input}
                disabled={submitting}
                required
              />
            </div>

            <button
              type="submit"
              className={`${styles.button} ${submitting ? styles.loading : ""}`}
              disabled={submitting}
            >
              {submitting ? "Überprüfe..." : "Überprüfen"}
            </button>
          </form>
        ) : (
          <div className={styles.result}>
            <p className={`${styles.resultMessage} ${resultMsg.isCorrect ? styles.correct : styles.incorrect}`}>
              {resultMsg.text}
            </p>
            <button
              className={styles.button}
              onClick={() => router.push("/report")}
            >
              Zum Tagesbericht
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
