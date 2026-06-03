export const createTable = `
  CREATE TABLE insights (
    id INTEGER PRIMARY KEY ASC NOT NULL,
    brand INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    text TEXT NOT NULL
  )
`;

export const createTableIfNotExists = createTable.replace(
  "CREATE TABLE",
  "CREATE TABLE IF NOT EXISTS",
);

export type Row = {
  id: number;
  brand: number;
  createdAt: string;
  text: string;
};

export type Insert = {
  brand: number;
  createdAt: string;
  text: string;
};

export type InsertStatement = [string, [number, string, string]];

export const insertStatement = (item: Insert): InsertStatement => [
  "INSERT INTO insights (brand, createdAt, text) VALUES (?, ?, ?)",
  [item.brand, item.createdAt, item.text],
];
