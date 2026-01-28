import type { Month, SeasonalEvent } from '../types';

export const MONTH_ORDER: Month[] = [
  'january', 'february', 'march', 'april',
  'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'
];

export function getCurrentMonth(): Month {
  return MONTH_ORDER[new Date().getMonth()];
}

export function getMonthNumber(month: Month): number {
  return MONTH_ORDER.indexOf(month) + 1;
}

export function isGoodTimeToVisit(
  bestMonths: Month[],
  avoidMonths: Month[],
  targetMonth?: Month
): boolean {
  const month = targetMonth || getCurrentMonth();
  if (avoidMonths.includes(month)) return false;
  return bestMonths.includes(month);
}

export function getUpcomingEvents(
  events: SeasonalEvent[],
  withinMonths: number = 3
): SeasonalEvent[] {
  const currentMonthIndex = MONTH_ORDER.indexOf(getCurrentMonth());
  const upcomingMonths: Month[] = [];

  for (let i = 0; i < withinMonths; i++) {
    upcomingMonths.push(MONTH_ORDER[(currentMonthIndex + i) % 12]);
  }

  return events.filter(event => upcomingMonths.includes(event.month));
}

export function getSeasonForMonth(
  month: Month,
  hemisphere: 'northern' | 'southern'
): string {
  const monthIndex = MONTH_ORDER.indexOf(month);

  const northernSeasons: Record<number, string> = {
    0: 'winter', 1: 'winter', 2: 'spring',
    3: 'spring', 4: 'spring', 5: 'summer',
    6: 'summer', 7: 'summer', 8: 'fall',
    9: 'fall', 10: 'fall', 11: 'winter'
  };

  if (hemisphere === 'northern') {
    return northernSeasons[monthIndex];
  }

  const southernMapping: Record<string, string> = {
    'winter': 'summer',
    'summer': 'winter',
    'spring': 'fall',
    'fall': 'spring'
  };
  return southernMapping[northernSeasons[monthIndex]];
}

export function formatMonthRange(months: Month[]): string {
  if (months.length === 0) return 'Year-round';
  if (months.length === 12) return 'Year-round';

  const sorted = [...months].sort((a, b) =>
    MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)
  );

  const capitalize = (m: Month) => m.charAt(0).toUpperCase() + m.slice(1);

  if (sorted.length === 1) {
    return capitalize(sorted[0]);
  }

  if (sorted.length === 2) {
    return `${capitalize(sorted[0])} & ${capitalize(sorted[1])}`;
  }

  const isConsecutive = sorted.every((month, i) => {
    if (i === 0) return true;
    return MONTH_ORDER.indexOf(month) === MONTH_ORDER.indexOf(sorted[i - 1]) + 1;
  });

  if (isConsecutive) {
    return `${capitalize(sorted[0])}-${capitalize(sorted[sorted.length - 1])}`;
  }

  return sorted.map(capitalize).join(', ');
}
