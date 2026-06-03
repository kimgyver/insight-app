import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import type { Insight } from "../schemas/insight.ts";
import { fetchInsights as apiFetchInsights } from "../lib/api.ts";

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = () => {
    apiFetchInsights().then((data) => {
      setInsights(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onRefresh={fetchInsights} />
      <Insights
        className={styles.insights}
        insights={insights}
        onRefresh={fetchInsights}
        loading={loading}
      />
    </main>
  );
};
