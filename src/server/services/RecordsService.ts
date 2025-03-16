export enum TokenType {
  // INSULIN
  INSULIN_NPH = "INSULIN_NPH",
  INSULIN_R = "INSULIN_R",
  INSULIN_UR = "INSULIN_UR",

  // GLUCOSE
  GLUCOSE = "GLUCOSE",
  SPELLED_HIGH_GLUCOSE = "SPELLED_HIGH_GLUCOSE",
  SPELLED_LOW_GLUCOSE = "SPELLED_LOW_GLUCOSE",

  // MEAL
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  SNACK = "SNACK",
  DINNER = "DINNER",
  FREE_MEAL = "FREE_MEAL",
  COMPENSATORY_MEAL = "COMPENSATORY_MEAL",

  // EXERCISE
  GYM = "GYM",
  STRENGTH_TRAINING = "STRENGTH_TRAINING",
  AEROBIC_EXERCISE = "AEROBIC_EXERCISE",

  // CONTROL
  IGNORE = "IGNORE",
  SAVE_NOTE = "SAVE_NOTE",
  DELETE = "DELETE",

  // INDEFINITE
  INDEFINITE = "INDEFINITE",
}

export enum RecordCategorie {
  INSULIN = "INSULIN",
  GLUCOSE = "GLUCOSE",
  MEAL = "MEAL",
  EXERCISE = "EXERCISE",
  CONTROL = "CONTROL",
  INDEFINITE = "INDEFINITE",
}

export interface Record {
  dirtyToken: string;
  token: string;
  tokenType: TokenType;
  categorie: RecordCategorie;
  dirtyTime?: string; // transformar em data
  stringValue?: string;
  numberValue?: number;
  unit?: string;
}

export const GLUCOSE_UNIT = "mg/dL";
export const INSULIN_UNIT = "UI";
