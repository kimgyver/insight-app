import type { Insight } from "../schemas/insight.ts";

export async function fetchInsights(): Promise<Insight[]> {
  const res = await fetch(`/api/insights`);
  const data: Array<{
    id: number;
    brand: number;
    createdAt: string;
    text: string;
  }> = await res.json();

  return data.map((item) => ({
    id: item.id,
    brandId: item.brand,
    date: new Date(item.createdAt),
    text: item.text,
  }));
}

export async function createInsight(
  brand: number,
  text: string,
): Promise<void> {
  await fetch(`/api/insights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ brand, text }),
  });
}

export async function deleteInsight(id: number): Promise<void> {
  await fetch(`/api/insights/${id}`, {
    method: "DELETE",
  });
}
