import * as moment from 'moment-timezone';
import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../../service';
import { _, StatsDataSource } from '../../../../../shared';
import {
  FetchAllConsumedRequest,
  FetchAllConsumedResponse,
  FetchAllSingleConsumedMealResponse
} from '../../../../../shared/selvera-api';
import { FoodData } from './food.data';
import { FoodDatabase } from './food.database';
import { FoodDayAmount } from './food.day-amount';

export class FoodDataSource extends StatsDataSource<
  FoodDayAmount,
  FetchAllConsumedResponse,
  FetchAllConsumedRequest,
  FoodData
> {
  TYPES = {
    breakfast: _('FOOD.BREAKFAST'),
    lunch: _('FOOD.LUNCH'),
    dinner: _('FOOD.DINNER'),
    snack: _('FOOD.SNACK')
  };

  constructor(protected notify: NotifierService, protected database: FoodDatabase) {
    super();
  }

  defaultData(): FetchAllConsumedResponse {
    return {
      meals: [],
      pagination: { next: null, prev: null }
    };
  }

  fetch(): Observable<FetchAllConsumedResponse> {
    return this.database.fetchAll(this.criteria);
  }

  mapResult(result: FetchAllConsumedResponse): FoodDayAmount[] {
    const data = this.calculateAmount(result.meals);
    this.stat$.next(data.progressCircleData);
    return data.tableData;
  }

  private calculateAmount(consumedMealResponse: FetchAllSingleConsumedMealResponse[]) {
    const dayMeals = {
      tableData: [],
      progressCircleData: new FoodData()
    };

    const groupedDays = this.groupBy(consumedMealResponse, meal => [meal.consumedDate]);
    this.addEmptyDays(groupedDays);
    this.addEmptyMeals(groupedDays);

    groupedDays.forEach(gd => {
      const dayAmount = new FoodDayAmount(false, 0);
      const types = [];
      gd.forEach(t => {
        dayAmount.consumedDate = t.consumedDate;
        dayAmount.calculateAmount(t);
        t.level = 1;
        t.isHidden = true;
        types.push(t);
      });

      const groupedTypes = this.groupBy(types, item => [item.type]);
      groupedTypes.forEach(gt => {
        const typeAmount = new FoodDayAmount(true, 1);
        gt.forEach(m => {
          typeAmount.type = m.type;
          typeAmount.calculateAmount(m);
          m.level = 2;
          m.isHidden = true;
          typeAmount.meals.push(m);
        });
        dayAmount.types.push(typeAmount);
      });

      dayMeals.progressCircleData.calculateAmount(dayAmount);
      dayMeals.tableData.push(dayAmount);
      dayAmount.types.forEach(dt => {
        dayMeals.tableData.push(dt);
        dayMeals.tableData.push(...dt.meals);
      });
    });
    dayMeals.progressCircleData.calculateAverage(groupedDays.length);

    return dayMeals;
  }

  private groupBy(array, groupBy) {
    const groups = {};
    array.forEach(item => {
      item.type = this.translateType(item.type);
      const groupName = JSON.stringify(groupBy(item));
      groups[groupName] = groups[groupName] || [];
      groups[groupName].push(item);
    });

    return Object.keys(groups).map(group => {
      return groups[group];
    });
  }

  private translateType(type) {
    return this.TYPES[type] ? this.TYPES[type] : type;
  }

  private addEmptyMeals(groupedFood) {
    groupedFood.forEach(groupedDays => {
      if (!groupedDays[0].isEmpty) {
        Object.keys(this.TYPES).forEach(type => {
          if (!groupedDays.some(meal => meal.type === type)) {
            this.addMeal(groupedDays, this.TYPES[type], groupedDays[0].consumedDate);
          }
        });
      }
    });
  }

  private addEmptyDays(groupedFood) {
    let endDate = moment
      .utc(this.args.endDate)
      .add(1, 'day')
      .format('YYYY-MM-DD');

    if (moment(endDate).isAfter(moment(), 'day')) {
      endDate = moment().format('YYYY-MM-DD');
    }

    for (
      let currentDate = this.args.startDate;
      currentDate !== endDate;
      currentDate = moment
        .utc(currentDate)
        .add(1, 'day')
        .format('YYYY-MM-DD')
    ) {
      if (!groupedFood.some(day => day[0].consumedDate === currentDate)) {
        const emptyFoodItem = new FoodDayAmount(false, 0);
        emptyFoodItem.consumedDate = currentDate;
        groupedFood.push([emptyFoodItem]);
      }
    }

    groupedFood.sort((a, b) => (a[0].consumedDate < b[0].consumedDate ? -1 : 1));
  }

  private addMeal(days, type, date) {
    const emptyFoodItem = new FoodDayAmount(true, 1);
    emptyFoodItem.type = type;
    emptyFoodItem.consumedDate = date;
    days.push(emptyFoodItem);
  }
}
