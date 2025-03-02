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
    // First check localStorage for the name
    const storedName = localStorage.getItem('userFirstName');
    if (storedName) {
      setFirstName(storedName);
    }

    // Still get the user ID and fetch profile if name not in localStorage
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (data?.user) {
        const userId = data.user.id;
        setUserId(userId);

        // Only fetch profile if we don't have the name from localStorage
        if (!storedName) {
          console.log("Fetching profile for user:", userId);
          
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select('first_name')
            .eq("user_id", userId)
            .maybeSingle();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            console.log("Full error details:", JSON.stringify(profileError, null, 2));
          } else if (profileData) {
            console.log("Profile data fetched:", profileData);
            setFirstName(profileData.first_name);
            localStorage.setItem('userFirstName', profileData.first_name);
          } else {
            console.log("No profile found for user");
          }
        }
      }
    });
  }, []);

  const handleSelectMood = async (mood: string) => {
    localStorage.setItem("mood", mood);
    window.location.href = "/category-selection";
  };

  return (
    <div className={styles.container}>
      <div className={styles.moodCard}>
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
