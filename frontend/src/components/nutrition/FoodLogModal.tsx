/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/nutrition/FoodLogModal.tsx
import {X, Trash2} from "lucide-react";
import type {CustomMeal} from "../../types";

interface Props {
  onClose: () => void;
  activeTab: "saved" | "quick" | "create";
  setActiveTab: (tab: "saved" | "quick" | "create") => void;
  customMeals: CustomMeal[];
  servings: number;
  setServings: (s: number) => void;
  handleLogSavedMeal: (id: string) => void;
  handleDeleteCustomMeal: (id: string) => void;
  isSubmitting: boolean;
  quickAddForm: any;
  setQuickAddForm: (data: any) => void;
  handleQuickAdd: (e: React.FormEvent) => void;
  createMealForm: any;
  setCreateMealForm: (data: any) => void;
  handleCreateCustomMeal: (e: React.FormEvent) => void;
}

export default function FoodLogModal({
  onClose,
  activeTab,
  setActiveTab,
  customMeals,
  servings,
  setServings,
  handleLogSavedMeal,
  handleDeleteCustomMeal,
  isSubmitting,
  quickAddForm,
  setQuickAddForm,
  handleQuickAdd,
  createMealForm,
  setCreateMealForm,
  handleCreateCustomMeal,
}: Props) {
  const inputClassName =
    "w-full px-6 py-5 mt-3 rounded-2xl bg-[#18181b] border border-[#3f3f46] text-white placeholder-[#71717a] focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all shadow-inner scheme-dark text-lg font-medium";
  const labelClassName =
    "block text-xs font-bold text-[#a1a1aa] uppercase tracking-xl ml-1 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#222] w-full max-w-3xl rounded-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div
          className="flex justify-between items-center py-8 border-b border-[#222]"
          style={{paddingLeft: "48px", paddingRight: "48px"}}
        >
          <h3
            className="text-3xl font-display text-white"
            style={{marginLeft: "16px"}}
          >
            Log Food
          </h3>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors cursor-pointer"
            style={{marginRight: "16px"}}
          >
            <X size={32} />
          </button>
        </div>

        <div className="flex border-b border-[#222]">
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-5 text-base font-bold tracking-widest uppercase transition-colors cursor-pointer ${activeTab === "saved" ? "text-(--accent) border-b-4 border-(--accent)" : "text-[#666] hover:text-white hover:bg-[#18181b]"}`}
          >
            Saved Meals
          </button>
          <button
            onClick={() => setActiveTab("quick")}
            className={`flex-1 py-5 text-base font-bold tracking-widest uppercase transition-colors cursor-pointer ${activeTab === "quick" ? "text-(--accent) border-b-4 border-(--accent)" : "text-[#666] hover:text-white hover:bg-[#18181b]"}`}
          >
            Quick Add
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-5 text-base font-bold tracking-widest uppercase transition-colors cursor-pointer ${activeTab === "create" ? "text-(--accent) border-b-4 border-(--accent)" : "text-[#666] hover:text-white hover:bg-[#18181b]"}`}
          >
            Create
          </button>
        </div>

        <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar">
          {activeTab === "saved" && (
            <div className="flex flex-col gap-5">
              {customMeals.length === 0 ? (
                <div className="text-center py-16 bg-[#18181b] rounded-2xl border border-[#222]">
                  <p className="text-[#888] text-lg">No saved meals yet.</p>
                  <p className="text-[#555] mt-2">
                    Go to "Create" to add your favorite meals.
                  </p>
                </div>
              ) : (
                customMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-[#18181b] border border-[#0b0909] p-6 rounded-3xl hover:border-[#444] transition-colors flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-bold text-xl leading-tight pr-2">
                        {meal.name}
                      </h4>
                      <button
                        onClick={() => handleDeleteCustomMeal(meal.id)}
                        className="text-[#555] hover:text-red-500 cursor-pointer p-2 shrink-0"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-wrap justify-between items-end gap-4 mt-1">
                      <div
                        className="flex flex-col gap-1.5"
                        style={{paddingLeft: "20px"}}
                      >
                        <span className="text-(--accent) font-bold text-lg">
                          {meal.calories} kcal
                        </span>
                        <span className="text-[#888] font-medium text-sm whitespace-nowrap">
                          Protein: {meal.protein}g • Carbs: {meal.carbs}g •
                          Fats: {meal.fats}g
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-3"
                        style={{paddingRight: "20px"}}
                      >
                        <input
                          type="number"
                          step="0.25"
                          min="0.25"
                          value={servings}
                          onChange={(e) => setServings(Number(e.target.value))}
                          className="w-16 bg-[#111] border border-[#333] rounded-xl p-3 text-center text-white text-base font-semibold focus:border-(--accent) outline-none"
                          title="Servings"
                        />
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleLogSavedMeal(meal.id)}
                          className="bg-(--accent) text-black px-5 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform cursor-pointer shrink-0"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "quick" && (
            <form onSubmit={handleQuickAdd} className="flex flex-col gap-8">
              <div>
                <label className={labelClassName}>Food Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Banana"
                  className={inputClassName}
                  value={quickAddForm.name}
                  onChange={(e) =>
                    setQuickAddForm({...quickAddForm, name: e.target.value})
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className={labelClassName}>Calories (kcal)</label>
                  <input
                    required
                    type="number"
                    className={inputClassName}
                    value={quickAddForm.cals}
                    onChange={(e) =>
                      setQuickAddForm({...quickAddForm, cals: e.target.value})
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName}>Protein (g)</label>
                  <input
                    required
                    type="number"
                    className={inputClassName}
                    value={quickAddForm.p}
                    onChange={(e) =>
                      setQuickAddForm({...quickAddForm, p: e.target.value})
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className={labelClassName}>Carbs (g)</label>
                  <input
                    required
                    type="number"
                    className={inputClassName}
                    value={quickAddForm.c}
                    onChange={(e) =>
                      setQuickAddForm({...quickAddForm, c: e.target.value})
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName}>Fats (g)</label>
                  <input
                    required
                    type="number"
                    className={inputClassName}
                    value={quickAddForm.f}
                    onChange={(e) =>
                      setQuickAddForm({...quickAddForm, f: e.target.value})
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-5 mt-4 rounded-2xl text-xl font-bold tracking-widest cursor-pointer"
              >
                LOG FOOD
              </button>
            </form>
          )}

          {activeTab === "create" && (
            <form
              onSubmit={handleCreateCustomMeal}
              className="flex flex-col gap-8"
            >
              <div>
                <label className={labelClassName}>Custom Meal Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mom's Macaroni"
                  className={inputClassName}
                  value={createMealForm.name}
                  onChange={(e) =>
                    setCreateMealForm({...createMealForm, name: e.target.value})
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className={labelClassName}>Total Calories</label>
                  <input
                    required
                    type="number"
                    className={inputClassName}
                    value={createMealForm.cals}
                    onChange={(e) =>
                      setCreateMealForm({
                        ...createMealForm,
                        cals: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName}>Protein (g)</label>
                  <input
                    required
                    type="number"
                    className={inputClassName}
                    value={createMealForm.p}
                    onChange={(e) =>
                      setCreateMealForm({...createMealForm, p: e.target.value})
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className={labelClassName}>Carbs (g)</label>
                  <input
                    required
                    type="number"
                    className={inputClassName}
                    value={createMealForm.c}
                    onChange={(e) =>
                      setCreateMealForm({...createMealForm, c: e.target.value})
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName}>Fats (g)</label>
                  <input
                    required
                    type="number"
                    className={inputClassName}
                    value={createMealForm.f}
                    onChange={(e) =>
                      setCreateMealForm({...createMealForm, f: e.target.value})
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 mt-4 rounded-2xl text-xl font-bold bg-[#18181b] text-white border border-[#3f3f46] hover:border-(--accent) hover:text-(--accent) transition-colors cursor-pointer tracking-widest"
              >
                SAVE MEAL
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
