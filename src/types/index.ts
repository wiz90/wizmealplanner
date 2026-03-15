// Types for Meal Planner

export interface UserProfile {
  goals: string[];
  hard_restrictions: string[];
  kitchen_tools: string[];
  custom_restrictions?: string[];  // 用户自定义禁忌
}

export interface SessionPlan {
  style_preferences: string[];
  soft_dislikes: string[];
  custom_dislikes?: string[];      // 用户自定义不喜欢
  days: number;
  meals_per_day: string[];
  person_count: number;
  budget?: string;                 // 预算: "20-30元/天", "30-50元/天", "50元以上"
}

export interface Recipe {
  recipe_name: string;
  tags: string[];
  time_cost: number;
  ingredients: string[];
  steps: string[];
}

export interface Dish {
  dish_type: '主菜' | '配菜' | '蔬菜' | '汤' | '主食' | '小菜' | '蛋白质' | string;
  recipe: Recipe;
}

export interface Meal {
  type: string;
  dishes: Dish[];
}

export interface DayPlan {
  day_index: number;
  meals: Meal[];
}

export interface MealPlan {
  cycle_id: string;
  profile: UserProfile;
  session_plan: SessionPlan;
  days: DayPlan[];
}
