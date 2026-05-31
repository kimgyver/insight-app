import { Trash2Icon } from "lucide-react";
import { cx } from "../../lib/cx.ts";
import { BRANDS } from "../../lib/consts.ts";
import styles from "./insights.module.css";
import type { Insight } from "../../schemas/insight.ts";

type InsightsProps = {
  insights: Insight[];
  className?: string;
  onRefresh: () => void;
  loading?: boolean;
};

export const Insights = ({
  insights,
  className,
  onRefresh,
  loading,
}: InsightsProps) => {
  const deleteInsight = async (id: number) => {
    await fetch(`/api/insights/${id}`, {
      method: "DELETE",
    });
    onRefresh();
  };

  return (
    <div className={cx(className)}>
      <h1 className={styles.heading}>Insights</h1>
      <div className={styles.list}>
        {loading ? <p>Loading...</p> : insights?.length
          ? (
            insights.map(({ id, text, date, brandId }) => (
              <div className={styles.insight} key={id}>
                <div className={styles["insight-meta"]}>
                  <span>
                    {BRANDS.find((b) =>
                      b.id === brandId
                    )?.name ?? brandId}
                  </span>
                  <div className={styles["insight-meta-details"]}>
                    <span>{date.toLocaleString()}</span>
                    <Trash2Icon
                      className={styles["insight-delete"]}
                      onClick={() => deleteInsight(id)}
                    />
                  </div>
                </div>
                <p className={styles["insight-content"]}>{text}</p>
              </div>
            ))
          )
          : <p>We have no insight!</p>}
      </div>
    </div>
  );
};
