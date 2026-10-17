import { STATS } from '../config';

// Adds up every base stat of every team member.
export function combineStats(team) {
  const totals = STATS.map((stat) => ({
    ...stat,
    value: team.reduce((sum, member) => {
      const found = member.stats.find((s) => s.key === stat.key);
      return sum + (found ? found.value : 0);
    }, 0),
  }));
  const grandTotal = totals.reduce((sum, s) => sum + s.value, 0);
  return { totals, grandTotal };
}
