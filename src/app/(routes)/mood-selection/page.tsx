"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import styles from "./mood-selection.module.css";

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
}

export default function MoodSelectionPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  const moodOptions: MoodOption[] = [
    { id: "sad", emoji: "😔", label: "Nicht so gut" },
    { id: "neutral", emoji: "😊", label: "Ganz gut" },
    { id: "happy", emoji: "🤩", label: "Fantastisch!" },
  ];

  useEffect(() => {
    // 1) Get the current user session from Supabase Auth
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (data?.user) {
        const userId = data.user.id;
        setUserId(userId);

        // 2) Fetch the user's profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("user_id", userId)
          .single();

        if (!profileError && profileData) {
          setFirstName(profileData.first_name);
        }
      }
    });
  }, []);

  const handleSelectMood = async (mood: string) => {
    // Store mood in localStorage for quiz
    localStorage.setItem("mood", mood);
    // Redirect to next page
    window.location.href = "/category-selection";
  };

  return (
    <div className={styles.container}>
      <div className={styles.moodCard}>
        {/* 3) Personalized greeting if we have first_name */}
        <h1 className={styles.title}>
          {firstName ? `Hallo ${firstName}! Wie fühlst du dich heute?` : "Wie fühlst du dich heute?"}
        </h1>
        <p className={styles.subtitle}>Wähle die Stimmung aus, die am besten zu dir passt</p>
        
        <div className={styles.moodGrid}>
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              className={styles.moodButton}
              onClick={() => handleSelectMood(mood.id)}
            >
              <span className={styles.emoji}>{mood.emoji}</span>
              <span className={styles.moodLabel}>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
