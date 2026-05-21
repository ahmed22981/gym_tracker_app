import {describe, test, expect, beforeEach, vi} from "vitest";
import {createSession} from "./client";

vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {request: {use: vi.fn()}, response: {use: vi.fn()}},
        post: vi.fn(),
      })),
    },
  };
});

describe("API Client Offline Logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saves request to offline queue when navigator is offline", async () => {
    vi.stubGlobal("navigator", {onLine: false});

    const payload = {name: "Leg Day"};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createSession(payload as any);

    expect(result.id).toMatch(/^temp-sess-/);
    expect(result.name).toBe("Leg Day");

    const queue = JSON.parse(localStorage.getItem("gym_offline_queue") || "[]");
    expect(queue.length).toBe(1);
    expect(queue[0].url).toBe("/sessions/");
    expect(queue[0].method).toBe("POST");
  });
});
