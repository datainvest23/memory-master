"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReportPage() {
  const [activity, setActivity] = useState<any[]>([]);
  const [prompt, setPrompt] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
        fetchDailyReport(data.user.id);
      }
    });
  }, []);

  const fetchDailyReport = async (uid: string) => {
    // Example: fetch user_activity from "today"
    // We'll do a naive approach: just fetch all, or you can filter by date
    const { data: activityData } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", uid)
      .order("timestamp", { ascending: false })
      .limit(10);

    // Also fetch the most recent memory prompt
    const { data: promptData } = await supabase
      .from("memory_prompts")
      .select("*")
      .eq("user_id", uid)
      .order("id", { ascending: false })
      .limit(1);

    setActivity(activityData || []);
    setPrompt(promptData && promptData.length > 0 ? promptData[0] : null);
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Tagesbericht</h1>

      <h2>Quiz-Aktivität</h2>
      {activity.length > 0 ? (
        <ul>
          {activity.map((item) => (
            <li key={item.id}>
              Frage-ID: {item.question_id}, Score: {item.score}, Mood: {item.mood},{" "}
              Zeit: {new Date(item.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>Keine Aktivitäten erfasst.</p>
      )}

      <h2>Erinnerung</h2>
      {prompt ? (
        <div>
          <p>Morgendliche Eingabe: {prompt.prompt_text}</p>
          <p>Abendliche Eingabe: {prompt.recalled_text || "Keine"}</p>
          <p>
            Ergebnis:{" "}
            {prompt.recall_score === 1
              ? "Richtig erinnert!"
              : prompt.recall_score === 0
              ? "Falsch"
              : "Noch nicht geprüft"}
          </p>
        </div>
      ) : (
        <p>Keine Erinnerung erfasst.</p>
      )}

      <button onClick={() => (window.location.href = "/")}>Zur Startseite</button>
    </main>
  );
}
