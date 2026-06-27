/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { 
  getUserProfile, updateUserProfile, 
  getDailySummary, getDailyFoodLogs, getCustomMeals,
  createDailyFoodLog, createCustomMeal, deleteDailyFoodLog, deleteCustomMeal,
  generateAIMealPlan,
  saveAIMealPlan
} from "../api/client";
import type { 
  UserProfile, UpdateProfilePayload, 
  DailyNutritionSummary, DailyFoodLog, CustomMeal, AIMealPlan 
} from "../types";
import MacroCircle from "../components/MacroCircle";
import { Edit3, Flame, Plus, Trash2, Calendar, Sparkles } from "lucide-react";
import Preloader from "../components/Preloader";
import Swal from "sweetalert2";

// Import the separated components
import MacroCalculatorForm from "../components/nutrition/MacroCalculatorForm";
import FoodLogModal from "../components/nutrition/FoodLogModal";
import AIDietitianModal from "../components/nutrition/AIDietitianModal";

export default function Nutrition() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [logs, setLogs] = useState<DailyFoodLog[]>([]);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'quick' | 'create'>('saved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [aiPlan, setAiPlan] = useState<AIMealPlan | null>(null);

  const [servings, setServings] = useState<number>(1);
  const [quickAddForm, setQuickAddForm] = useState({ name: "", cals: "", p: "", c: "", f: "" });
  const [createMealForm, setCreateMealForm] = useState({ name: "", cals: "", p: "", c: "", f: "" });

  const [formData, setFormData] = useState<UpdateProfilePayload>({
    gender: "M", date_of_birth: "", weight_kg: undefined, height_cm: undefined, activity_level: "ACTIVE", goal: "CUT",
  });

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

  const handleGenerateAIPlan = async () => {
    setIsAIModalOpen(true);
    setIsAILoading(true);
    try {
      const plan = await generateAIMealPlan();
      setAiPlan(plan);
    } catch (err: any) {
      console.error("AI Generation failed", err);
      setIsAIModalOpen(false);
      
      const errorMessage = err.response?.data?.error || "Network error. Make sure backend is running.";
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        background: '#18181b',
        color: '#ffffff',
        confirmButtonColor: '#c084fc',
        confirmButtonText: 'Got it',
        customClass: {
          popup: 'border border-[#3f3f46] rounded-[24px]',
        }
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSaveAIPlan = async () => {
    if (!aiPlan) return;
    setIsSavingPlan(true); // 👈 دي كانت false عندك بالغلط
    try {
      await saveAIMealPlan({date: selectedDate, meals: aiPlan.meals})
      await loadData();
      setIsAIModalOpen(false)
      setAiPlan(null);

      Swal.fire({
        title: "Success",
        text: "Today's meal plan has populated with AI recommendations",
        icon: 'success',
        background: '#18181b',
        color: '#ffffff',
        confirmButtonColor: 'var(--accent)',
        confirmButtonText: 'Let\'s Crush It',
        customClass: {
          popup: 'border border-[#3f3f46] rounded-[24px]'
        }
      })
    }catch (err){
      console.error("Failed to save AI plan", err)
      Swal.fire({
        title: "Error",
        text: "Failed to save the meal plan. Please try again.",
        icon: "error",
        background: '#18181b',
        color: '#ffffff',
        confirmButtonColor: '#c084fc'
      });
    } finally {
      setIsSavingPlan(false)
    }
  }

  if (loading && !profile) return <Preloader text="Loading..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 150px)", width: "100%", position: "relative" }}>
      
      <div style={{ flexShrink: 0, marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="font-display text-3xl mb-2 flex items-center gap-2 text-white">
            <Flame color="var(--accent)" size={32} /> NUTRITION
          </h1>
          <p className="text-[#888] text-base">
            Calibrate your fuel for maximum performance.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-3 bg-[#18181b] border border-[#3f3f46] px-5 py-4 rounded-2xl shadow-inner focus-within:border-(--accent) focus-within:ring-1 focus-within:ring-(--accent) transition-all">
            <Calendar size={22} className="text-(--accent)" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none scheme-dark text-base sm:text-lg font-medium cursor-pointer"
            />
          </div>

          {!isEditing && profile?.weight_kg && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="cursor-pointer p-4 rounded-2xl bg-[#18181b] border border-[#3f3f46] text-[#888] hover:text-white hover:bg-[#333] transition-all shadow-lg flex items-center justify-center"
              title="Edit Macros"
            >
              <Edit3 size={28} />
            </button>
          )}
        </div>
      </div>

      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "80px" }}>
        
        {isEditing || !profile?.target_calories ? (
          <MacroCalculatorForm 
            formData={formData} setFormData={setFormData}
            onSubmit={handleProfileSubmit} loading={loading}
            showCancel={!!profile?.weight_kg} onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div style={{ width: "100%", maxWidth: "700px" }} className="flex flex-col gap-6">
            
            <div className="bg-[#111] rounded-4xl p-8 flex flex-col items-center text-center shadow-xl border border-[#222] relative overflow-hidden">
              <div className="flex flex-col items-center justify-center mb-8 w-full gap-2 text-center">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer w-full bg-[#18181b] border border-[#3f3f46] hover:border-(--accent) text-white py-5 rounded-3xl text-lg tracking-widest font-bold flex justify-center items-center gap-4 transition-all group shadow-2xl"
              >
                <div className="bg-(--accent) text-black p-2 rounded-full group-hover:scale-110 transition-transform"><Plus size={20} strokeWidth={3} /></div>
                LOG FOOD
              </button>

              <button 
                onClick={handleGenerateAIPlan}
                className="cursor-pointer w-full bg-[#18181b] border border-[#3f3f46] hover:border-[#c084fc] text-white py-5 rounded-3xl text-lg tracking-widest font-bold flex justify-center items-center gap-4 transition-all group shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#c084fc]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="bg-[#c084fc] text-black p-2 rounded-full group-hover:scale-110 transition-transform"><Sparkles size={20} strokeWidth={2.5} /></div>
                AI DIETITIAN
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-[#a1a1aa] font-bold text-sm uppercase tracking-wider mb-4 px-2">Timeline</h3>
              {logs.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center bg-[#111] border border-[#222] rounded-3xl shadow-inner">
                  <p className="text-[#888] font-medium text-base">No food logged on this date yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {logs.map(log => (
                    // 👈 التعديل الأهم هنا: items-start عشان الأيقونة تفضل فوق، و flex-1 عشان الاسم والمكونات ياخدوا مساحتهم
                    <div key={log.id} className="bg-[#111] border border-[#222] px-8 py-6 rounded-3xl flex justify-between items-start hover:border-[#333] transition-colors shadow-sm ">
                      <div style={{paddingLeft: "10px"}} className="flex-1 pr-6">
                        <h4 className="text-white font-bold text-lg flex items-center gap-3">
                          {log.meal_name} 
                          {log.servings !== 1 && <span className="bg-[#222] text-[#888] text-xs px-2.5 py-1 rounded-md">x{log.servings}</span>}
                        </h4>

                        {log.details && (
                          <div className="text-[#a1a1aa] text-sm mt-3 whitespace-pre-wrap leading-relaxed font-medium">
                            {log.details}
                          </div>
                        )}

                        <div className="flex gap-5 mt-4 text-sm font-semibold">
                          <span className="text-(--accent)">{log.calories} kcal</span>
                          <span className="text-blue-400">P: {log.protein}g</span>
                          <span className="text-orange-400">C: {log.carbs}g</span>
                          <span className="text-yellow-500">F: {log.fats}g</span>
                        </div>
                      </div>
                      
                      <button onClick={() => handleDeleteLog(log.id)} className="self-center p-4 bg-[#18181b] rounded-xl text-[#666] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0">
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

      {isModalOpen && (
        <FoodLogModal 
          onClose={() => setIsModalOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab}
          customMeals={customMeals} servings={servings} setServings={setServings}
          handleLogSavedMeal={handleLogSavedMeal} handleDeleteCustomMeal={handleDeleteCustomMeal}
          isSubmitting={isSubmitting} quickAddForm={quickAddForm} setQuickAddForm={setQuickAddForm}
          handleQuickAdd={handleQuickAdd} createMealForm={createMealForm} setCreateMealForm={setCreateMealForm}
          handleCreateCustomMeal={handleCreateCustomMeal}
        />
      )}

      {isAIModalOpen && (
        <AIDietitianModal 
          onClose={() => { setIsAIModalOpen(false); setAiPlan(null); }} 
          isLoading={isAILoading} 
          aiPlan={aiPlan}
          onSavePlan={handleSaveAIPlan}
          isSaving={isSavingPlan} 
        />
      )}

    </div>
  );
}