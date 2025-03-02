"use client";

import { useState } from "react";
import styles from "./category-selection.module.css";

interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export default function CategorySelectionPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories: Category[] = [
    {
      id: "mathe",
      name: "Mathe",
      emoji: "🔢",
      description: "Mathematische Rätsel und Aufgaben"
    },
    {
      id: "geografie",
      name: "Geografie",
      emoji: "🌍",
      description: "Länder, Hauptstädte und Geografie"
    },
    {
      id: "geschichte",
      name: "Name Recall (Historische)",
      emoji: "⌛",
      description: "Historische Persönlichkeiten und Ereignisse"
    },
    {
      id: "logik",
      name: "Logikrätsel",
      emoji: "🧩",
      description: "Knifflige Denkaufgaben"
    },
    {
      id: "wortschatz",
      name: "Wortschatz/Rechtschreibung",
      emoji: "📚",
      description: "Sprachliche Herausforderungen"
    },
    {
      id: "trivia",
      name: "Daily Trivia",
      emoji: "🎯",
      description: "Tägliche Wissensfragen"
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleContinue = () => {
    if (selectedCategories.length === 0) {
      alert("Bitte wähle mindestens eine Kategorie aus.");
      return;
    }
    localStorage.setItem("selectedCategories", JSON.stringify(selectedCategories));
    window.location.href = "/quiz";
  };

  return (
    <div className={styles.container}>
      <div className={styles.categoryCard}>
        <h1 className={styles.title}>Wähle deine Kategorien</h1>
        <p className={styles.subtitle}>Wähle die Bereiche aus, in denen du dich heute verbessern möchtest</p>

        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${
                selectedCategories.includes(category.id) ? styles.selected : ""
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <span className={styles.emoji}>{category.emoji}</span>
              <span className={styles.categoryName}>{category.name}</span>
              <span className={styles.categoryDescription}>
                {category.description}
              </span>
            </button>
          ))}
        </div>

        <button 
          className={styles.continueButton}
          onClick={handleContinue}
          disabled={selectedCategories.length === 0}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
