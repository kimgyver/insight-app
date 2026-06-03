import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import type { Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import createInsight from "./create-insight.ts";

describe("creating an insight in the database", () => {
  describe("with valid input", () => {
    withDB((fixture) => {
      let result: Insight;

      beforeAll(() => {
        result = createInsight({ ...fixture, brand: 1, text: "Test insight" });
      });

      it("returns the created insight", () => {
        expect(result.brand).toBe(1);
        expect(result.text).toBe("Test insight");
        expect(result.id).toBeGreaterThan(0);
        expect(result.createdAt).toBeInstanceOf(Date);
      });

      it("persists the insight to the database", () => {
        const rows = fixture.insights.selectAll();
        expect(rows.length).toBe(1);
        expect(rows[0].text).toBe("Test insight");
      });
    });
  });
});
