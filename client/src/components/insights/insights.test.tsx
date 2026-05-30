import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Insights } from "./insights.tsx";

const TEST_INSIGHTS = [
  {
    id: 1,
    brandId: 1,
    date: new Date(),
    text: "Test insight",
  },
  { id: 2, brandId: 2, date: new Date(), text: "Another test insight" },
];

describe("insights", () => {
  it("renders", () => {
    const { getByText } = render(
      <Insights insights={TEST_INSIGHTS} onRefresh={() => undefined} />,
    );
    expect(getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
  });

  it("shows loading message", () => {
    const { getByText } = render(
      <Insights insights={[]} loading onRefresh={() => undefined} />,
    );

    expect(getByText("Loading...")).toBeTruthy();
  });

  it("shows empty state message", () => {
    const { getByText } = render(
      <Insights insights={[]} loading={false} onRefresh={() => undefined} />,
    );

    expect(getByText("We have no insight!")).toBeTruthy();
  });
});
