/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calculator, Activity, Target } from "lucide-react";
import type { UpdateProfilePayload } from "../../types";

interface Props {
  formData: UpdateProfilePayload;
  setFormData: (data: UpdateProfilePayload) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onCancel?: () => void;
  showCancel: boolean;
}

export default function MacroCalculatorForm({ formData, setFormData, onSubmit, loading, onCancel, showCancel }: Props) {
  const inputClassName = "w-full px-6 py-5 mt-3 rounded-2xl bg-[#18181b] border border-[#3f3f46] text-white placeholder-[#71717a] focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all shadow-inner scheme-dark text-lg font-medium";
  const labelClassName = "block text-xs font-bold text-[#a1a1aa] uppercase tracking-xl ml-1 mb-2";
  const optionClassName = "bg-[#18181b] text-white";

  return (
    <div style={{ width: "100%", maxWidth: "896px" }} className="bg-[#111111] border border-[#222] rounded-3xl p-12 sm:p-16 shadow-2xl relative overflow-hidden">
      <h2 className="text-2xl font-display mb-10 flex items-center gap-3 text-white">
        <Calculator size={24} color="var(--accent)" /> Macro Calculator
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Gender</label>
            <select className={inputClassName} value={formData.gender || "M"} onChange={(e) => setFormData({...formData, gender: e.target.value as "M" | "F"})}>
              <option value="M" className={optionClassName}>Male</option>
              <option value="F" className={optionClassName}>Female</option>
            </select>
          </div>
          <div>
            <label className={labelClassName}>Birth Date</label>
            <input type="date" required className={inputClassName} value={formData.date_of_birth || ""} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Weight (kg)</label>
            <input type="number" step="0.1" required className={inputClassName} value={formData.weight_kg || ""} onChange={(e) => setFormData({...formData, weight_kg: parseFloat(e.target.value)})} />
          </div>
          <div>
            <label className={labelClassName}>Height (cm)</label>
            <input type="number" step="1" required className={inputClassName} value={formData.height_cm || ""} onChange={(e) => setFormData({...formData, height_cm: parseFloat(e.target.value)})} />
          </div>
        </div>
        <div>
          <label className={labelClassName}><div className="flex items-center gap-2"><Activity size={12} color="var(--accent)" /> Activity Level</div></label>
          <select className={inputClassName} value={formData.activity_level || "ACTIVE"} onChange={(e) => setFormData({...formData, activity_level: e.target.value as any})}>
            <option value="SEDENTARY" className={optionClassName}>Sedentary (Desk job)</option>
            <option value="LIGHT" className={optionClassName}>Light (1-3 days/week)</option>
            <option value="MODERATE" className={optionClassName}>Moderate (3-5 days/week)</option>
            <option value="ACTIVE" className={optionClassName}>Active (PPL / 6 days/week)</option>
            <option value="VERY_ACTIVE" className={optionClassName}>Very Active (Physical job)</option>
          </select>
        </div>
        <div>
          <label className={labelClassName}><div className="flex items-center gap-2"><Target size={12} color="var(--accent)" /> Goal</div></label>
          <select className={inputClassName} value={formData.goal || "CUT"} onChange={(e) => setFormData({...formData, goal: e.target.value as any})}>
            <option value="CUT" className={optionClassName}>Lose Fat (Cut)</option>
            <option value="MAINTAIN" className={optionClassName}>Maintain Weight</option>
            <option value="BULK" className={optionClassName}>Build Muscle (Bulk)</option>
          </select>
        </div>
        <div className="mt-4 pt-6 border-t border-[#222]">
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base rounded-xl font-bold flex justify-center shadow-[0_0_20px_rgba(206,255,0,0.15)] transition-all">
            {loading ? "Calculating..." : "Calculate My Macros"}
          </button>
          {showCancel && onCancel && (
             <button type="button" onClick={onCancel} className="mt-4 w-full text-center text-sm font-semibold text-[#777] hover:text-white transition-colors cursor-pointer">Cancel</button>
          )}
        </div>
      </form>
    </div>
  );
}