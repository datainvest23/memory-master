"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./quiz.module.css";

interface Question {
  id: number;
  kategorie: string;
  frage: string;
  antwortoptionen: string[] | null;
  korrekte_antwort: string;
  schwierigkeitsgrad: number;
  tag: string | null;
  erklaerung: string | null;
}

interface DebugInfo {
  userId?: string;
  mood?: string;
  selectedCategories?: string[];
  initTime?: string;
  lastError?: any;
  lastAttemptedActivity?: any;
  lastSuccessfulActivity?: any;
  errorTime?: string;
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});

  useEffect(() => {
    const initQuiz = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Auth check result:", { user });
        
        if (user) {
          setUserId(user.id);
          setDebugInfo((prev: DebugInfo) => ({ ...prev, userId: user.id }));
        }
        await fetchQuestions();
      } catch (err) {
        console.error("Error initializing quiz:", err);
        setError("Failed to initialize quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, []);

  const fetchQuestions = async () => {
    try {
      const mood = localStorage.getItem("mood") || "neutral";
      const stored = localStorage.getItem("selectedCategories");
      const selectedIds = stored ? JSON.parse(stored) : [];
      
      console.log("Quiz initialization:", {
        mood,
        selectedCategories: selectedIds,
        timestamp: new Date().toISOString()
      });
      
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        mood,
        selectedCategories: selectedIds,
        initTime: new Date().toISOString()
      }));

      // Map category IDs to actual category names
      const categoryMapping: { [key: string]: string } = {
        "mathe": "Mathe",
        "geografie": "Geografie",
        "geschichte": "Name Recall (Historische)",
        "logik": "Logikrätsel",
        "wortschatz": "Wortschatz/Rechtschreibung",
        "trivia": "Daily Trivia"
      };

      const categories = selectedIds.map((id: string) => categoryMapping[id]).filter(Boolean);
      console.log("Selected categories:", categories);

      if (categories.length === 0) {
        throw new Error("No categories selected");
      }

      let combined: Question[] = [];

      if (mood === "sad") {
        // Only difficulty level 1 questions
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .in("kategorie", categories)
          .eq("schwierigkeitsgrad", 1)
          .limit(5);
        if (error) throw error;
        combined = data;
      } else if (mood === "neutral") {
        // Use difficulty 2 and 3: e.g., 3 questions from diff=2, 2 from diff=3
        const { data: diff2, error: err2 } = await supabase
          .from("questions")
          .select("*")
          .in("kategorie", categories)
          .eq("schwierigkeitsgrad", 2)
          .limit(3);
        if (err2) throw err2;
        const { data: diff3, error: err3 } = await supabase
          .from("questions")
          .select("*")
          .in("kategorie", categories)
          .eq("schwierigkeitsgrad", 3)
          .limit(2);
        if (err3) throw err3;
        combined = [...(diff2 || []), ...(diff3 || [])];
      } else if (mood === "happy") {
        // Use difficulty 2 and 3 with a higher proportion of diff=3
        const { data: diff2, error: err2 } = await supabase
          .from("questions")
          .select("*")
          .in("kategorie", categories)
          .eq("schwierigkeitsgrad", 2)
          .limit(2);
        if (err2) throw err2;
        const { data: diff3, error: err3 } = await supabase
          .from("questions")
          .select("*")
          .in("kategorie", categories)
          .eq("schwierigkeitsgrad", 3)
          .limit(3);
        if (err3) throw err3;
        combined = [...(diff2 || []), ...(diff3 || [])];
      }

      shuffleArray(combined);
      setQuestions(combined);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err instanceof Error ? err.message : "Failed to load questions");
    }
  };

  // Simple array shuffle function
  const shuffleArray = (arr: Question[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!questions[current]) return;
    const correct = questions[current].korrekte_antwort.trim() === answer.trim();
    const mood = localStorage.getItem("mood") || "neutral";
    
    console.log("Processing answer:", {
      questionId: questions[current].id,
      userAnswer: answer,
      correctAnswer: questions[current].korrekte_antwort,
      isCorrect: correct,
      mood,
      userId,
      timestamp: new Date().toISOString()
    });

    if (correct) {
      setScore((prev) => prev + 1);
    }

    if (!userId) {
      console.error("No userId available for logging activity");
      return;
    }

    try {
      const activityData = {
        user_id: userId,
        question_id: questions[current].id,
        score: correct ? 1 : 0,
        session_type: 'quiz',
        mood: mood,
        timestamp: new Date().toISOString()
      };

      console.log("Attempting to insert activity:", activityData);
      
      const { data, error: activityError } = await supabase
        .from("user_activity")
        .insert([activityData])
        .select();

      if (activityError) {
        console.error("Error logging answer:", activityError);
        console.log("Full error details:", JSON.stringify(activityError, null, 2));
        setError("Fehler beim Speichern der Antwort. Die Antworten werden möglicherweise nicht für den Bericht gespeichert.");
        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          lastError: activityError,
          lastAttemptedActivity: activityData
        }));
      } else {
        console.log("Successfully logged activity:", data);
        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          lastSuccessfulActivity: activityData
        }));
      }
    } catch (err) {
      console.error("Error logging answer:", err);
      console.log("Full error:", err);
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        lastError: err,
        errorTime: new Date().toISOString()
      }));
    }

    setCurrent((prev) => prev + 1);
  };

  // Debug panel component
  const DebugPanel = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      maxWidth: '400px',
      maxHeight: '400px',
      overflow: 'auto',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4>Debug Info</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      <button onClick={() => console.log('Current state:', {
        questions,
        current,
        score,
        userId,
        loading,
        error,
        debugInfo
      })}>
        Log State
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Lade Fragen...</h2>
          <div className={styles.loader}></div>
        </div>
        <DebugPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Ein Fehler ist aufgetreten</h2>
          <p className={styles.error}>{error}</p>
          <button 
            className={styles.button}
            onClick={() => window.location.href = "/category-selection"}
          >
            Zurück zur Kategorieauswahl
          </button>
        </div>
        <DebugPanel />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Keine Fragen gefunden</h2>
          <p>Bitte wähle andere Kategorien aus.</p>
          <button 
            className={styles.button}
            onClick={() => window.location.href = "/category-selection"}
          >
            Zurück zur Kategorieauswahl
          </button>
        </div>
        <DebugPanel />
      </div>
    );
  }

  if (current >= questions.length) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Quiz fertig!</h2>
          <p className={styles.score}>Dein Score: {score} / {questions.length}</p>
          <button 
            className={styles.button}
            onClick={() => window.location.href = "/memory-prompt"}
          >
            Weiter
          </button>
        </div>
        <DebugPanel />
      </div>
    );
  }

  const q = questions[current];
  const opts = q.antwortoptionen || [];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.questionMeta}>
          <span className={styles.kategorie}>{q.kategorie}</span>
          <span className={styles.schwierigkeit}>Schwierigkeit: {q.schwierigkeitsgrad}</span>
        </div>
        <h2>Frage {current + 1} von {questions.length}</h2>
        <p className={styles.question}>{q.frage}</p>
        <div className={styles.options}>
          {opts.length > 0 ? (
            opts.map((opt) => (
              <button
                key={opt}
                className={styles.optionButton}
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </button>
            ))
          ) : (
            <button 
              className={styles.optionButton}
              onClick={() => handleAnswer("UserInput")}
            >
              Antworten
            </button>
          )}
        </div>
      </div>
      <DebugPanel />
    </div>
  );
}
