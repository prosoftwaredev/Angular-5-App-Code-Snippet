export class FoodData {
  calories = { goal: 2000, avg: 0, amount: 0 };
  protein = { goal: 0, avg: 0, amount: 0 };
  carbohydrate = { goal: 0, avg: 0, amount: 0 };
  totalFat = { goal: 0, avg: 0, amount: 0 };

  calculateAmount(meal) {
    this.calories.amount += meal.calories;
    this.protein.amount += meal.protein;
    this.totalFat.amount += meal.totalFat;
    this.carbohydrate.amount += meal.carbohydrate;
  }

  calculateAverage(daysNumber) {
    this.calories.avg = this.calories.amount / daysNumber;
    this.protein.avg = this.protein.amount / daysNumber;
    this.totalFat.avg = this.totalFat.amount / daysNumber;
    this.carbohydrate.avg = this.carbohydrate.amount / daysNumber;
  }
}
