/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { 
  getUserProfile, updateUserProfile, 
  getDailySummary, getDailyFoodLogs, getCustomMeals,
  createDailyFoodLog, createCustomMeal, deleteDailyFoodLog, deleteCustomMeal
} from "../api/client";
import type { 
  UserProfile, UpdateProfilePayload, 
  DailyNutritionSummary, DailyFoodLog, CustomMeal 
} from "../types";
import MacroCircle from "../components/MacroCircle";
import { Calculator, Edit3, Target, Flame, Activity, Plus, Trash2, X, Calendar } from "lucide-react";
import Preloader from "../components/Preloader";

export default function Nutrition() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- New State for Food Tracking ---
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [logs, setLogs] = useState<DailyFoodLog[]>([]);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'quick' | 'create'>('saved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [servings, setServings] = useState<number>(1);
  const [quickAddForm, setQuickAddForm] = useState({ name: "", cals: "", p: "", c: "", f: "" });
  const [createMealForm, setCreateMealForm] = useState({ name: "", cals: "", p: "", c: "", f: "" });

  const [formData, setFormData] = useState<UpdateProfilePayload>({
    gender: "M", date_of_birth: "", weight_kg: undefined, height_cm: undefined, activity_level: "ACTIVE", goal: "CUT",
  });

  // --- Data Fetching ---
  const loadData = async () => {
    try {
      const [profileData, summaryData, logsData, mealsData] = await Promise.all([
        getUserProfile(),
        getDailySummary(selectedDate),
        getDailyFoodLogs(selectedDate),
        getCustomMeals()
      ]);
      
      setProfile(profileData);
      setSummary(summaryData);
      setLogs(logsData);
      setCustomMeals(mealsData);

      if (!profileData.weight_kg) setIsEditing(true);
      else {
        setFormData({
          gender: profileData.gender, date_of_birth: profileData.date_of_birth,
          weight_kg: profileData.weight_kg, height_cm: profileData.height_cm,
          activity_level: profileData.activity_level, goal: profileData.goal,
        });
      }
    } catch (error) {
      console.error("Failed to load nutrition data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // --- Handlers ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedProfile = await updateUserProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogSavedMeal = async (mealId: string) => {
    setIsSubmitting(true);
    try {
      await createDailyFoodLog({ date: selectedDate, custom_meal: mealId, servings });
      await loadData();
      setIsModalOpen(false);
      setServings(1);
    } catch (err) { console.error(err); } 
    finally { setIsSubmitting(false); }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createDailyFoodLog({
        date: selectedDate,
        meal_name: quickAddForm.name,
        servings: 1,
        calories: Number(quickAddForm.cals),
        protein: Number(quickAddForm.p),
        carbs: Number(quickAddForm.c),
        fats: Number(quickAddForm.f)
      });
      await loadData();
      setIsModalOpen(false);
      setQuickAddForm({ name: "", cals: "", p: "", c: "", f: "" });
    } catch (err) { console.error(err); } 
    finally { setIsSubmitting(false); }
  };

  const handleCreateCustomMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createCustomMeal({
        name: createMealForm.name,
        calories: Number(createMealForm.cals),
        protein: Number(createMealForm.p),
        carbs: Number(createMealForm.c),
        fats: Number(createMealForm.f)
      });
      await loadData();
      setActiveTab('saved');
      setCreateMealForm({ name: "", cals: "", p: "", c: "", f: "" });
    } catch (err) { console.error(err); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteDailyFoodLog(id);
      await loadData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteCustomMeal = async (id: string) => {
    if(!window.confirm("Are you sure you want to delete this saved meal?")) return;
    try {
      await deleteCustomMeal(id);
      await loadData();
    } catch (err) { console.error(err); }
  };

  if (loading && !profile) return <Preloader text="Loading..." />;

  const inputClassName = "w-full px-6 py-5 mt-3 rounded-2xl bg-[#18181b] border border-[#3f3f46] text-white placeholder-[#71717a] focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all shadow-inner scheme-dark text-lg font-medium";
  const labelClassName = "block text-xs font-bold text-[#a1a1aa] uppercase tracking-xl ml-1 mb-2";
  const optionClassName = "bg-[#18181b] text-white";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 150px)", width: "100%", position: "relative" }}>
      
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        
        {/* Left Side: Title & Subtitle */}
        <div>
          <h1 className="font-display text-3xl mb-2 flex items-center gap-2 text-white">
            <Flame color="var(--accent)" size={32} /> NUTRITION
          </h1>
          <p className="text-[#888] text-base">
            Calibrate your fuel for maximum performance.
          </p>
        </div>

        {/* Right Side: Date Picker & Edit Button */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* 1. Date Picker */}
          <div className="flex items-center gap-3 bg-[#18181b] border border-[#3f3f46] px-5 py-4 rounded-2xl shadow-inner focus-within:border-(--accent) focus-within:ring-1 focus-within:ring-(--accent) transition-all">
            <Calendar size={22} className="text-(--accent)" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none scheme-dark text-base sm:text-lg font-medium cursor-pointer"
            />
          </div>

          {/* 2. Edit Button */}
          {!isEditing && profile?.weight_kg && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="cursor-pointer p-4 rounded-2xl bg-[#18181b] border border-[#3f3f46] text-[#888] hover:text-black hover:bg-(--accent) hover:border-(--accent) hover:scale-105 transition-all shadow-lg group flex items-center justify-center"
              title="Edit Macros"
            >
              <Edit3 size={28} className="group-hover:rotate-12 transition-transform" />
            </button>
          )}
          
        </div>
      </div>

      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "80px" }}>
        
        {isEditing || !profile?.target_calories ? (
          /* ================== MACRO CALCULATOR FORM ================== */
          <div style={{ width: "100%", maxWidth: "896px" }} className="bg-[#111111] border border-[#222] rounded-3xl p-12 sm:p-16 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-display mb-10 flex items-center gap-3 text-white">
              <Calculator size={24} color="var(--accent)" /> Macro Calculator
            </h2>
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>Gender</label>
                  <select className={inputClassName} value={formData.gender || "M"} onChange={(e) => setFormData({...formData, gender: e.target.value as any})}>
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
                {profile?.weight_kg && (
                   <button type="button" onClick={() => setIsEditing(false)} className="mt-4 w-full text-center text-sm font-semibold text-[#777] hover:text-white transition-colors">Cancel</button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* ================== THE DASHBOARD & TRACKER ================== */
          <div style={{ width: "100%", maxWidth: "700px" }} className="flex flex-col gap-6">
            
            {/* Macro Circles */}
            <div className="bg-[#111] rounded-4xl p-8 flex flex-col items-center text-center shadow-xl border border-[#222] relative overflow-hidden">
              
              <div className="flex flex-col items-center justify-center mb-8 mt-2 w-full gap-2 text-center">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#888] m-0 p-0">Consumed / Target</h2>
                <span className="text-[--accent] text-xs font-bold uppercase tracking-wider m-0 p-0">{selectedDate === new Date().toISOString().split('T')[0] ? "TODAY" : selectedDate}</span>
              </div>

              <MacroCircle 
                label="Calories" 
                value={summary?.consumed_calories || 0} 
                unit={`/ ${profile.target_calories} kcal`} 
                color="var(--accent)" 
                size={220} strokeWidth={14} 
              />

              <div className="grid grid-cols-3 gap-4 w-full mt-10">
                <div className="flex flex-col items-center">
                  <MacroCircle label="Protein" value={summary?.consumed_protein || 0} unit={`/ ${profile.target_protein}g`} color="#3b82f6" size={100} strokeWidth={8} />
                </div>
                <div className="flex flex-col items-center">
                  <MacroCircle label="Carbs" value={summary?.consumed_carbs || 0} unit={`/ ${profile.target_carbs}g`} color="#f97316" size={100} strokeWidth={8} />
                </div>
                <div className="flex flex-col items-center">
                  <MacroCircle label="Fats" value={summary?.consumed_fats || 0} unit={`/ ${profile.target_fats}g`} color="#eab308" size={100} strokeWidth={8} />
                </div>
              </div>
            </div>

            {/* Log Food Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className=" cursor-pointer w-full bg-[#18181b] border border-[#3f3f46] hover:border-(--accent) text-white py-6 rounded-3xl text-lg tracking-widest font-bold flex justify-center items-center gap-4 transition-all group shadow-2xl"
            >
              <div className="bg-(--accent) text-black p-2 rounded-full group-hover:scale-110 transition-transform"><Plus size={24} strokeWidth={3} /></div>
              LOG FOOD
            </button>

            {/* Food Timeline */}
            <div className="mt-8">
              <h3 className="text-[#a1a1aa] font-bold text-sm uppercase tracking-wider mb-4 px-2">Timeline</h3>
              {logs.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center bg-[#111] border border-[#222] rounded-3xl shadow-inner">
                  <p className="text-[#888] font-medium text-base">No food logged on this date yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {logs.map(log => (
                    <div key={log.id} className="bg-[#111] border border-[#222] px-8 py-6 rounded-3xl flex justify-between items-center hover:border-[#333] transition-colors shadow-sm ">
                      <div style={{paddingLeft: "10px"}}>
                        <h4 className="text-white font-bold text-lg flex items-center gap-3">
                          {log.meal_name} 
                          {log.servings !== 1 && <span className="bg-[#222] text-[#888] text-xs px-2.5 py-1 rounded-md">x{log.servings}</span>}
                        </h4>
                        <div className="flex gap-5 mt-3 text-sm font-semibold">
                          <span className="text-(--accent)">{log.calories} kcal</span>
                          <span className="text-blue-400">P: {log.protein}g</span>
                          <span className="text-orange-400">C: {log.carbs}g</span>
                          <span className="text-yellow-500">F: {log.fats}g</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteLog(log.id)} className="p-4 bg-[#18181b] rounded-xl text-[#666] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" style={{paddingRight: "10px"}}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ================== FOOD LOGGING MODAL ================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#222] w-full max-w-3xl rounded-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center py-8 border-b border-[#222]" style={{ paddingLeft: '48px', paddingRight: '48px' }}>
              <h3 className="text-3xl font-display text-white" style={{ marginLeft: '16px' }}>Log Food</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#666] hover:text-white transition-colors cursor-pointer" style={{ marginRight: '16px' }}>
                <X size={32} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#222]">
              <button onClick={() => setActiveTab('saved')} className={`flex-1 py-5 text-base font-bold tracking-widest uppercase transition-colors cursor-pointer ${activeTab === 'saved' ? 'text-(--accent) border-b-4 border-(--accent)' : 'text-[#666] hover:text-white hover:bg-[#18181b]'}`}>Saved Meals</button>
              <button onClick={() => setActiveTab('quick')} className={`flex-1 py-5 text-base font-bold tracking-widest uppercase transition-colors cursor-pointer ${activeTab === 'quick' ? 'text-(--accent) border-b-4 border-(--accent)' : 'text-[#666] hover:text-white hover:bg-[#18181b]'}`}>Quick Add</button>
              <button onClick={() => setActiveTab('create')} className={`flex-1 py-5 text-base font-bold tracking-widest uppercase transition-colors cursor-pointer ${activeTab === 'create' ? 'text-(--accent) border-b-4 border-(--accent)' : 'text-[#666] hover:text-white hover:bg-[#18181b]'}`}>Create</button>
            </div>

            <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar">
              
              {/* Tab 1: Saved Meals */}
              {activeTab === 'saved' && (
                <div className="flex flex-col gap-5">
                  {customMeals.length === 0 ? (
                    <div className="text-center py-16 bg-[#18181b] rounded-2xl border border-[#222]">
                      <p className="text-[#888] text-lg">No saved meals yet.</p>
                      <p className="text-[#555] mt-2">Go to "Create" to add your favorite meals.</p>
                    </div>
                  ) : (
                    customMeals.map(meal => (
                      <div key={meal.id} className="bg-[#18181b] border border-[#0b0909] p-6 rounded-3xl hover:border-[#444] transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-white font-bold text-xl">{meal.name}</h4>
                          <button onClick={() => handleDeleteCustomMeal(meal.id)} className="text-[#555] hover:text-red-500 cursor-pointer p-2"><Trash2 size={20}/></button>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col gap-2">
                            <span className="text-(--accent) font-bold text-lg">{meal.calories} kcal</span>
                            <span className="text-[#888] font-medium text-sm">Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fats: {meal.fats}g</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="number" step="0.25" min="0.25" value={servings} onChange={(e)=>setServings(Number(e.target.value))} className="w-20 bg-[#111] border border-[#333] rounded-xl p-3 text-center text-white text-base focus:border-(--accent) outline-none" title="Servings" />
                            <button disabled={isSubmitting} onClick={() => handleLogSavedMeal(meal.id)} className="bg-(--accent) text-black px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform cursor-pointer">ADD</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Quick Add */}
              {activeTab === 'quick' && (
                <form onSubmit={handleQuickAdd} className="flex flex-col gap-8">
                  <div>
                    <label className={labelClassName}>Food Name</label>
                    <input required type="text" placeholder="e.g. Banana" className={inputClassName} value={quickAddForm.name} onChange={e => setQuickAddForm({...quickAddForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className={labelClassName}>Calories (kcal)</label>
                      <input required type="number" className={inputClassName} value={quickAddForm.cals} onChange={e => setQuickAddForm({...quickAddForm, cals: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelClassName}>Protein (g)</label>
                      <input required type="number" className={inputClassName} value={quickAddForm.p} onChange={e => setQuickAddForm({...quickAddForm, p: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className={labelClassName}>Carbs (g)</label>
                      <input required type="number" className={inputClassName} value={quickAddForm.c} onChange={e => setQuickAddForm({...quickAddForm, c: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelClassName}>Fats (g)</label>
                      <input required type="number" className={inputClassName} value={quickAddForm.f} onChange={e => setQuickAddForm({...quickAddForm, f: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-5 mt-4 rounded-2xl text-xl font-bold tracking-widest cursor-pointer">LOG FOOD</button>
                </form>
              )}

              {/* Tab 3: Create Custom Meal */}
              {activeTab === 'create' && (
                <form onSubmit={handleCreateCustomMeal} className="flex flex-col gap-8">
                  <div>
                    <label className={labelClassName}>Custom Meal Name</label>
                    <input required type="text" placeholder="e.g. Mom's Macaroni" className={inputClassName} value={createMealForm.name} onChange={e => setCreateMealForm({...createMealForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className={labelClassName}>Total Calories</label>
                      <input required type="number" className={inputClassName} value={createMealForm.cals} onChange={e => setCreateMealForm({...createMealForm, cals: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelClassName}>Protein (g)</label>
                      <input required type="number" className={inputClassName} value={createMealForm.p} onChange={e => setCreateMealForm({...createMealForm, p: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className={labelClassName}>Carbs (g)</label>
                      <input required type="number" className={inputClassName} value={createMealForm.c} onChange={e => setCreateMealForm({...createMealForm, c: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelClassName}>Fats (g)</label>
                      <input required type="number" className={inputClassName} value={createMealForm.f} onChange={e => setCreateMealForm({...createMealForm, f: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-5 mt-4 rounded-2xl text-xl font-bold bg-[#18181b] text-white border border-[#3f3f46] hover:border-(--accent) hover:text-(--accent) transition-colors cursor-pointer tracking-widest">SAVE MEAL</button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}