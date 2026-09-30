export const MIN_AGE = 13;
export const MAX_AGE = 18;

export function ageFromDateOfBirth(dateOfBirth: string, now = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) return NaN;

  const [, year, month, day] = match.map(Number);
  const saNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const age = saNow.getUTCFullYear() - year;
  const beforeBirthday =
    saNow.getUTCMonth() + 1 < month ||
    (saNow.getUTCMonth() + 1 === month && saNow.getUTCDate() < day);

  return beforeBirthday ? age - 1 : age;
}

export function isEligibleAge(age: number): boolean {
  return Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE;
}
