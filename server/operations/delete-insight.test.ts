import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { withDB } from "../testing.ts";
import deleteInsight from "./delete-insight.ts";

describe("deleting an insight from the database", () => {
  describe("insight exists", () => {
    withDB((fixture) => {
      let result: { success: boolean };

      beforeAll(() => {
        fixture.insights.insert([
          {
            brand: 1,
            createdAt: new Date().toISOString(),
            text: "To be deleted",
          },
        ]);
        result = deleteInsight({ ...fixture, id: 1 });
      });

      it("returns success", () => {
        expect(result).toEqual({ success: true });
      });

      it("removes the insight from the database", () => {
        const rows = fixture.insights.selectAll();
        expect(rows.length).toBe(0);
      });
    });
  });

  describe("insight does not exist", () => {
    withDB((fixture) => {
      let result: { success: boolean };

      beforeAll(() => {
        result = deleteInsight({ ...fixture, id: 999 });
      });

      it("returns success", () => {
        expect(result).toEqual({ success: true });
      });
    });
  });
});
