/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Nutrition from "./Nutrition";
import * as api from "../api/client";

vi.mock("../api/client", () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  getDailySummary: vi.fn(),
  getDailyFoodLogs: vi.fn(),
  getCustomMeals: vi.fn(),
  createDailyFoodLog: vi.fn(),
  createCustomMeal: vi.fn(),
  deleteDailyFoodLog: vi.fn(),
  deleteCustomMeal: vi.fn(),
}));

describe("Nutrition Integration Tests", () => {
  const mockProfile = {
    gender: "M",
    date_of_birth: "1998-01-01",
    weight_kg: 80,
    height_cm: 180,
    activity_level: "ACTIVE",
    goal: "CUT",
    target_calories: 2200,
    target_protein: 160,
    target_carbs: 200,
    target_fats: 60
  };

  const mockSummary = {
    date: "2026-06-21",
    consumed_calories: 500,
    consumed_protein: 40,
    consumed_carbs: 50,
    consumed_fats: 10
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders macro dashboard when profile exists", async () => {
    vi.mocked(api.getUserProfile).mockResolvedValue(mockProfile as any);
    vi.mocked(api.getDailySummary).mockResolvedValue(mockSummary);
    vi.mocked(api.getDailyFoodLogs).mockResolvedValue([]);
    vi.mocked(api.getCustomMeals).mockResolvedValue([]);

    render(<Nutrition />);

    await waitFor(() => {
      expect(screen.getByText("Consumed / Target")).toBeInTheDocument();
    });

    expect(screen.getByText(/2200 kcal/i)).toBeInTheDocument();
  });

  test("opens modal and submits quick add food", async () => {
    vi.mocked(api.getUserProfile).mockResolvedValue(mockProfile as any);
    vi.mocked(api.getDailySummary).mockResolvedValue(mockSummary);
    vi.mocked(api.getDailyFoodLogs).mockResolvedValue([]);
    vi.mocked(api.getCustomMeals).mockResolvedValue([]);
    vi.mocked(api.createDailyFoodLog).mockResolvedValue({} as any);

    render(<Nutrition />);

    await waitFor(() => {
      expect(screen.getByText("LOG FOOD")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("LOG FOOD"));

    expect(screen.getByText("Quick Add")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Quick Add"));

    const inputs = screen.getAllByRole("spinbutton");
    const nameInput = screen.getByPlaceholderText("e.g. Banana");

    fireEvent.change(nameInput, { target: { value: "Apple" } });
    fireEvent.change(inputs[0], { target: { value: "95" } });
    fireEvent.change(inputs[1], { target: { value: "0" } });
    fireEvent.change(inputs[2], { target: { value: "25" } });
    fireEvent.change(inputs[3], { target: { value: "0" } });

    fireEvent.click(screen.getAllByText("LOG FOOD")[1]);

    await waitFor(() => {
      expect(api.createDailyFoodLog).toHaveBeenCalledWith(
        expect.objectContaining({
          meal_name: "Apple",
          calories: 95,
          protein: 0,
          carbs: 25,
          fats: 0
        })
      );
    });
  });
});