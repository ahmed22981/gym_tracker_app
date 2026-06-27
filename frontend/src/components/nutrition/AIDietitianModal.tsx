import { X, Sparkles, Check } from "lucide-react";
import type { AIMealPlan } from "../../types";

interface Props {
  onClose: () => void;
  isLoading: boolean;
  aiPlan: AIMealPlan | null;
  onSavePlan: () => void;   
  isSaving: boolean;
}

export default function AIDietitianModal({ onClose, isLoading, aiPlan, onSavePlan, isSaving }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#222] w-full max-w-3xl rounded-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center py-8 border-b border-[#222] px-8 sm:px-12">
          <h3 className="text-2xl sm:text-3xl font-display text-white flex items-center gap-3">
            <Sparkles className="text-[#c084fc]" size={28} /> AI Dietitian
          </h3>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors cursor-pointer">
            <X size={32} />
          </button>
        </div>

        <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#c084fc] blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Sparkles className="text-[#c084fc] animate-spin-slow relative" size={56} />
              </div>
              <p className="text-[#888] text-lg font-medium animate-pulse tracking-wide text-center">
                Crafting your perfect meal plan...
              </p>
            </div>
          ) : aiPlan ? (
            <div className="flex flex-col gap-8">
              <div className="bg-[#18181b] border border-[#222] rounded-3xl p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-left">
                  <h4 className="text-2xl font-bold text-white mb-3">{aiPlan.plan_title}</h4>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-bold tracking-widest uppercase">
                    <span className="text-[#c084fc]">{aiPlan.total_calories} kcal</span>
                    <span className="text-blue-400">P: {aiPlan.total_protein}g</span>
                    <span className="text-orange-400">C: {aiPlan.total_carbs}g</span>
                    <span className="text-yellow-500">F: {aiPlan.total_fats}g</span>
                  </div>
                </div>
                
                <button
                  onClick={onSavePlan}
                  disabled={isSaving}
                  className="cursor-pointer bg-[#c084fc] text-black font-bold px-6 py-4 rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 text-sm tracking-wider shadow-[0_0_15px_rgba(192,132,252,0.3)]"
                >
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check size={18} strokeWidth={3} /> LOG TO TIMELINE
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex flex-col gap-5">
                {aiPlan.meals.map((meal, idx) => (
                  <div key={idx} className="bg-[#18181b] border border-[#222] rounded-3xl p-6 hover:border-[#333] transition-colors">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-5 pb-5 border-b border-[#2a2a2a]">
                      <h5 className="text-xl font-bold text-white">{meal.meal_name}</h5>
                      <div className="flex gap-4 text-xs font-bold bg-[#111] px-4 py-2.5 rounded-xl border border-[#222]">
                        <span className="text-(--accent)">{meal.calories} kcal</span>
                        <span className="text-blue-400">{meal.protein}g</span>
                        <span className="text-orange-400">{meal.carbs}g</span>
                        <span className="text-yellow-500">{meal.fats}g</span>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {meal.items.map((item, i) => (
                        <li key={i} className="text-[#a1a1aa] flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#c084fc] mt-2 flex-shrink-0 shadow-[0_0_8px_#c084fc]"></div>
                          <span className="text-base font-medium leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-red-500 font-medium text-lg">
              Failed to load plan. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}