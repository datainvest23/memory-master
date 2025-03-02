"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          throw error;
        }

        if (session) {
          console.log("Session found, redirecting to mood selection");
          router.push("/mood-selection");
        } else {
          console.log("No session found, redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return null;
}
