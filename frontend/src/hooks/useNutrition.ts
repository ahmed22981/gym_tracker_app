/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useEffect} from "react";
import Swal from "sweetalert2";
import {getUserProfile, updateUserProfile} from "../api/auth";
import {
  getDailySummary,
  getDailyFoodLogs,
  getCustomMeals,
  createDailyFoodLog,
  createCustomMeal,
  deleteDailyFoodLog,
  deleteCustomMeal,
  generateAIMealPlan,
  saveAIMealPlan,
} from "../api/nutrition";
import type {
  UserProfile,
  UpdateProfilePayload,
  DailyNutritionSummary,
  DailyFoodLog,
  CustomMeal,
  AIMealPlan,
} from "../types";

export function useNutrition() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [logs, setLogs] = useState<DailyFoodLog[]>([]);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"saved" | "quick" | "create">(
    "saved",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIMealPlan | null>(null);

  const [servings, setServings] = useState<number>(1);
  const [quickAddForm, setQuickAddForm] = useState({
    name: "",
    cals: "",
    p: "",
    c: "",
    f: "",
  });
  const [createMealForm, setCreateMealForm] = useState({
    name: "",
    cals: "",
    p: "",
    c: "",
    f: "",
  });

  const [formData, setFormData] = useState<UpdateProfilePayload>({
    gender: "M",
    date_of_birth: "",
    weight_kg: undefined,
    height_cm: undefined,
    activity_level: "ACTIVE",
    goal: "CUT",
  });

  const loadData = async () => {
    try {
      const [profileData, summaryData, logsData, mealsData] = await Promise.all(
        [
          getUserProfile(),
          getDailySummary(selectedDate),
          getDailyFoodLogs(selectedDate),
          getCustomMeals(),
        ],
      );

      setProfile(profileData);
      setSummary(summaryData);
      setLogs(logsData);
      setCustomMeals(mealsData);

      if (!profileData.weight_kg) setIsEditing(true);
      else {
        setFormData({
          gender: profileData.gender,
          date_of_birth: profileData.date_of_birth,
          weight_kg: profileData.weight_kg,
          height_cm: profileData.height_cm,
          activity_level: profileData.activity_level,
          goal: profileData.goal,
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
      await createDailyFoodLog({
        date: selectedDate,
        custom_meal: mealId,
        servings,
      });
      await loadData();
      setIsModalOpen(false);
      setServings(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
        fats: Number(quickAddForm.f),
      });
      await loadData();
      setIsModalOpen(false);
      setQuickAddForm({name: "", cals: "", p: "", c: "", f: ""});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
        fats: Number(createMealForm.f),
      });
      await loadData();
      setActiveTab("saved");
      setCreateMealForm({name: "", cals: "", p: "", c: "", f: ""});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteDailyFoodLog(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomMeal = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this saved meal?"))
      return;
    try {
      await deleteCustomMeal(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
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

      const errorMessage =
        err.response?.data?.error ||
        "Network error. Make sure backend is running.";

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        background: "#18181b",
        color: "#ffffff",
        confirmButtonColor: "#c084fc",
        confirmButtonText: "Got it",
        customClass: {popup: "border border-[#3f3f46] rounded-[24px]"},
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSaveAIPlan = async () => {
    if (!aiPlan) return;
    setIsSavingPlan(true);
    try {
      await saveAIMealPlan({date: selectedDate, meals: aiPlan.meals});
      await loadData();
      setIsAIModalOpen(false);
      setAiPlan(null);

      Swal.fire({
        title: "Success",
        text: "Today's meal plan has populated with AI recommendations",
        icon: "success",
        background: "#18181b",
        color: "#ffffff",
        confirmButtonColor: "var(--accent)",
        confirmButtonText: "Let's Crush It",
        customClass: {popup: "border border-[#3f3f46] rounded-[24px]"},
      });
    } catch (err) {
      console.error("Failed to save AI plan", err);
      Swal.fire({
        title: "Error",
        text: "Failed to save the meal plan. Please try again.",
        icon: "error",
        background: "#18181b",
        color: "#ffffff",
        confirmButtonColor: "#c084fc",
      });
    } finally {
      setIsSavingPlan(false);
    }
  };

  return {
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    loading,
    setLoading,
    selectedDate,
    setSelectedDate,
    summary,
    logs,
    customMeals,
    isModalOpen,
    setIsModalOpen,
    activeTab,
    setActiveTab,
    isSubmitting,
    isAILoading,
    isAIModalOpen,
    setIsAIModalOpen,
    isSavingPlan,
    aiPlan,
    setAiPlan,
    servings,
    setServings,
    quickAddForm,
    setQuickAddForm,
    createMealForm,
    setCreateMealForm,
    formData,
    setFormData,
    handleProfileSubmit,
    handleLogSavedMeal,
    handleQuickAdd,
    handleCreateCustomMeal,
    handleDeleteLog,
    handleDeleteCustomMeal,
    handleGenerateAIPlan,
    handleSaveAIPlan,
  };
}
