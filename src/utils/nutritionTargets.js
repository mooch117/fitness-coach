export const MACRO_CALORIE_TOLERANCE = 50;

function hasValue(value) {
  return value !== "" && value !== null && value !== undefined;
}

export function calculateCaloriesFromMacros(form) {
  const macroValues = [form.protein_grams, form.carb_grams, form.fat_grams];

  const allMacrosEntered = macroValues.every(
    (value) => value !== "" && value !== null && value !== undefined,
  );

  if (!allMacrosEntered) {
    return "";
  }

  const proteinGrams = Number(form.protein_grams);
  const carbGrams = Number(form.carb_grams);
  const fatGrams = Number(form.fat_grams);

  const numbers = [proteinGrams, carbGrams, fatGrams];

  if (!numbers.every(Number.isFinite) || numbers.some((value) => value < 0)) {
    return "";
  }

  return String(proteinGrams * 4 + carbGrams * 4 + fatGrams * 9);
}
