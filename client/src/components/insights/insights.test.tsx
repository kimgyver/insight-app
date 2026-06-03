import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
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

  it("deletes an insight and refreshes", async () => {
    const onRefresh = vi.fn();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const { container } = render(
      <Insights insights={[TEST_INSIGHTS[0]]} onRefresh={onRefresh} />,
    );

    const deleteIcon = container.querySelector("svg");
    expect(deleteIcon).toBeTruthy();
    fireEvent.click(deleteIcon!);

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/insights/1", {
        method: "DELETE",
      });
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
