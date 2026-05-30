import type { FormEvent } from "react";
import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onRefresh: () => void;
};

export const AddInsight = ({ onRefresh, ...props }: AddInsightProps) => {
  const addInsight = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const brandId = form.querySelector("select")?.value;
    const text = form.querySelector("textarea")?.value?.trim();

    if (!brandId || !text) {
      return;
    }

    await fetch(`/api/insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand: Number(brandId),
        text,
      }),
    });

    props.onClose();
    onRefresh();
  };

  return (
    <Modal {...props}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          <select
            className={styles["field-input"]}
            defaultValue={String(BRANDS[0].id)}
          >
            {BRANDS.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            required
          />
        </label>
        <Button className={styles.submit} type="submit" label="Add insight" />
      </form>
    </Modal>
  );
};
