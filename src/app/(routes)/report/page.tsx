// src/app/(routes)/report/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReportPage() {
  const [activity, setActivity] = useState<any[]>([]);
  const [prompt, setPrompt] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Error getting user:", error);
        setError("Error getting user session."); // Set error
        return;
      }

      if (data?.user) {
        setUserId(data.user.id);
        console.log("ReportPage: User ID:", data.user.id); // Log the user ID
        fetchDailyReport(data.user.id);
      } else {
        console.log("ReportPage: No user session found.");
        setError("User not logged in."); // Set error
      }
    });
  }, []);

    const fetchDailyReport = async (uid: string) => {
        setError(null); // Clear previous errors.
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

            console.log("ReportPage: Fetching activity for user:", uid, "between", today.toISOString(), "and", tomorrow.toISOString());

            const { data: activityData, error: activityError } = await supabase
                .from("user_activity")
                .select("*")
                .eq("user_id", uid)
                .gte("timestamp", today.toISOString())
                .lt("timestamp", tomorrow.toISOString())
                .order("timestamp", { ascending: false });


            if (activityError) {
                console.error("ReportPage: Error fetching activity:", activityError);
                throw activityError; // Re-throw to be caught by outer try/catch
            }
            console.log("ReportPage: Activity data:", activityData); // Log the fetched data
            setActivity(activityData || []);


            const { data: promptData, error: promptError } = await supabase
                .from("memory_prompts")
                .select("*")
                .eq("user_id", uid)
                .gte("created_at", today.toISOString())
                .lt("created_at", tomorrow.toISOString())
                .order("created_at", { ascending: false })  // Use created_at for ordering, id can be misleading if created out of order.
                .maybeSingle(); // Use maybeSingle()

            if (promptError) {
                console.error("ReportPage: Error fetching prompt:", promptError);
                throw promptError;  // Re-throw
            }

            console.log("ReportPage: Prompt data:", promptData); // Log the fetched data
            setPrompt(promptData);

        } catch (error) {
             console.error("ReportPage: Error in fetchDailyReport:", error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred.");
        }
    };

  if (error) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Tagesbericht</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => (window.location.href = "/")}>Zur Startseite</button>
      </main>
    );
  }


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