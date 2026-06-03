import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): boolean => {
  console.log(`Deleting insight id=${input.id}`);

  const rows = input.db.sql<{ id: number }>`
    DELETE FROM insights
    WHERE id = ${input.id}
    RETURNING id
  `;

  return rows.length > 0;
};
