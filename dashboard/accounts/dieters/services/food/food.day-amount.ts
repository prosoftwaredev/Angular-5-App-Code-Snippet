import {
  FetchAllConsumedMealIngredients,
  FetchAllSingleConsumedMealResponse
} from '../../../../../shared/selvera-api';

export class FoodDayAmount implements FetchAllSingleConsumedMealResponse {
  consumedDate = undefined;
  type = undefined;
  metadata = undefined;
  calories = 0;
  protein = 0;
  carbohydrate = 0;
  totalFat = 0;
  types = [];
  meals = [];
  level = 0;
  isHidden = false;
  isExpanded = false;

  id: string;
  name: string;
  imageUrl: string;
  saturatedFat: number;
  cholesterol: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients?: Array<FetchAllConsumedMealIngredients>;

  get isEmpty(): boolean {
    return this.calories === 0;
  }

  constructor(isHidden, level) {
    this.isHidden = isHidden;
    this.level = level;
  }

  calculateAmount(meal: FetchAllSingleConsumedMealResponse) {
    this.calories += meal.calories;
    this.protein += meal.protein;
    this.totalFat += meal.totalFat;
    this.carbohydrate += meal.carbohydrate;
  }
}
