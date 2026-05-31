import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AddInsight } from "./add-insight.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("add insight", () => {
  it("submits a new insight and refreshes", async () => {
    const onClose = vi.fn();
    const onRefresh = vi.fn();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 201 }),
    );

    const { getByRole, getByText, getByPlaceholderText } = render(
      <AddInsight open onClose={onClose} onRefresh={onRefresh} />,
    );

    fireEvent.change(getByRole("combobox"), { target: { value: "2" } });
    fireEvent.change(getByPlaceholderText("Something insightful..."), {
      target: { value: "A new insight" },
    });
    fireEvent.click(getByText("Add insight"));

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: 2,
          text: "A new insight",
        }),
      });
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it("does not submit when text is blank", async () => {
    const onClose = vi.fn();
    const onRefresh = vi.fn();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 201 }),
    );

    const { getByPlaceholderText, getByText } = render(
      <AddInsight open onClose={onClose} onRefresh={onRefresh} />,
    );

    fireEvent.change(getByPlaceholderText("Something insightful..."), {
      target: { value: "   " },
    });
    fireEvent.click(getByText("Add insight"));

    await vi.waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(onRefresh).not.toHaveBeenCalled();
    });
  });
});
