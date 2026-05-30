import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): { success: boolean } => {
  console.log(`Deleting insight id=${input.id}`);

  input.db.sql`
    DELETE FROM insights
    WHERE id = ${input.id}
  `;

  return { success: true };
};
