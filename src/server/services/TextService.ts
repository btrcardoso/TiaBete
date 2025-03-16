import dotenv from "dotenv";
import {
  TokenType,
  Record,
  RecordCategorie,
  INSULIN_UNIT,
  GLUCOSE_UNIT,
  HIGH_GLUCOSE,
  LOW_GLUCOSE,
  BaseRecord,
} from "./RecordsService";

dotenv.config();

const TIME_H = /^([01]?[0-9]|2[0-3])h([0-5][0-9])?|^([01]?[0-9]|2[0-3])h/;
const TIME_COLON = /^([01]?[0-9]|2[0-3]):[0-5][0-9]/;

const IGNORE_REGEX = /^ignor/;
const SAVE_NOTE_REGEX = /^salv(ar?|e)?/;
const DELETE_REGEX = /^(excluir|delete|deletar)/;

const numberRegex = /^[0-9]+/;
const INSULIN_NPH_REGEX = /^[0-9]+\s?(n|nph)$/;
const INSULIN_R_REGEX = /^[0-9]+\s?(r|reg|regular)$/;
const INSULIN_UR_REGEX = /^[0-9]+\s?(u\s?r|ultra\s?rapida|fiasp)$/;

const GLUCOSE_REGEX =
  /^(gl(i|u)c?o?s?e?\s?)?\d+\s?(mg\/?dl|(gl(i|u)c?o?s?e?))?$/;
const SPELLED_HIGH_GLUCOSE_REGEX =
  /^(hiperg?l?i?c?e?m?i?a?)\s?(leve|braba|grave)?/;
const SPELLED_LOW_GLUCOSE_REGEX =
  /^(hipog?l?i?c?e?m?i?a?)\s?(leve|braba|grave)?/;

const BREAKFAST_REGEX = /^cafe/;
const LUNCH_REGEX = /^almoc(o|ei)?/;
const SNACK_REGEX = /^lanchei?/;
const DINNER_REGEX = /^jant(ar?|ei)?/;
const FREE_MEAL_REGEX = /^refeicao\slivre/;
const COMPENSATORY_MEAL_REGEX = /^compens(ar|ei)?/;

const GYM_REGEX = /^(trein(o|ei)?|acad(emia)?)/;
const STRENGTH_TRAINING_REGEX = /^musc(ulacao)?/;
const AEROBIC_EXERCISE_REGEX = /^((cardio(vascular)?)|(aerobi(o|co)))/;
// const HEAVY_STRENGTH_TRAINING_REGEX = /^musc(ulacao)?(\s(pesad(o|a)|forte))?/;
// const LIGHT_STRENGTH_TRAINING_REGEX = /^musc(ulacao)?(\sleve)?/;
// const HEAVY_AEROBIC_EXERCISE_REGEX =
//   /^((cardio(vascular)?)|(aerobi(o|co)))(\s(pesad(o|a)|forte))?/;
// const LIGHT_AEROBIC_EXERCISE_REGEX =
//   /^((cardio(vascular)?)|(aerobi(o|co)))(\sleve)?/;

function sanitizeMessage(message: string) {
  return message
    .toLowerCase() // Converte para minúsculas
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, " ") // Substitui múltiplos espaços por um único
    .trim(); // Remove espaços extras no início e fim
}

function buildBaseRecord(token: string): BaseRecord {
  const numericTokenParts = separateMatchedAndRemainingParts(
    token,
    numberRegex
  );
  if (IGNORE_REGEX.test(token)) {
    return {
      tokenType: TokenType.IGNORE,
      categorie: RecordCategorie.INDEFINITE,
      stringValue: undefined,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (SAVE_NOTE_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(token, SAVE_NOTE_REGEX);
    return {
      tokenType: TokenType.SAVE_NOTE,
      categorie: RecordCategorie.CONTROL,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (DELETE_REGEX.test(token)) {
    return {
      tokenType: TokenType.DELETE,
      categorie: RecordCategorie.CONTROL,
      stringValue: undefined,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (INSULIN_NPH_REGEX.test(token)) {
    return {
      tokenType: TokenType.INSULIN_NPH,
      categorie: RecordCategorie.INSULIN,
      stringValue: numericTokenParts.remainingPart,
      numberValue: Number(numericTokenParts.matchedPart),
      unit: INSULIN_UNIT,
    };
  } else if (INSULIN_R_REGEX.test(token)) {
    return {
      tokenType: TokenType.INSULIN_R,
      categorie: RecordCategorie.INSULIN,
      stringValue: numericTokenParts.remainingPart,
      numberValue: Number(numericTokenParts.matchedPart),
      unit: INSULIN_UNIT,
    };
  } else if (INSULIN_UR_REGEX.test(token)) {
    return {
      tokenType: TokenType.INSULIN_UR,
      categorie: RecordCategorie.INSULIN,
      stringValue: numericTokenParts.remainingPart,
      numberValue: Number(numericTokenParts.matchedPart),
      unit: INSULIN_UNIT,
    };
  } else if (GLUCOSE_REGEX.test(token)) {
    return {
      tokenType: TokenType.GLUCOSE,
      categorie: RecordCategorie.GLUCOSE,
      stringValue: numericTokenParts.remainingPart,
      numberValue: Number(numericTokenParts.matchedPart),
      unit: GLUCOSE_UNIT,
    };
  } else if (SPELLED_HIGH_GLUCOSE_REGEX.test(token)) {
    return {
      tokenType: TokenType.SPELLED_HIGH_GLUCOSE,
      categorie: RecordCategorie.GLUCOSE,
      stringValue: undefined,
      numberValue: HIGH_GLUCOSE,
      unit: GLUCOSE_UNIT,
    };
  } else if (SPELLED_LOW_GLUCOSE_REGEX.test(token)) {
    return {
      tokenType: TokenType.SPELLED_LOW_GLUCOSE,
      categorie: RecordCategorie.GLUCOSE,
      stringValue: undefined,
      numberValue: LOW_GLUCOSE,
      unit: GLUCOSE_UNIT,
    };
  } else if (BREAKFAST_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(token, BREAKFAST_REGEX);
    return {
      tokenType: TokenType.BREAKFAST,
      categorie: RecordCategorie.MEAL,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (LUNCH_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(token, LUNCH_REGEX);
    return {
      tokenType: TokenType.LUNCH,
      categorie: RecordCategorie.MEAL,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (SNACK_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(token, SNACK_REGEX);
    return {
      tokenType: TokenType.SNACK,
      categorie: RecordCategorie.MEAL,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (DINNER_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(token, DINNER_REGEX);
    return {
      tokenType: TokenType.DINNER,
      categorie: RecordCategorie.MEAL,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (FREE_MEAL_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(token, FREE_MEAL_REGEX);
    return {
      tokenType: TokenType.FREE_MEAL,
      categorie: RecordCategorie.MEAL,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (COMPENSATORY_MEAL_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(
      token,
      COMPENSATORY_MEAL_REGEX
    );
    return {
      tokenType: TokenType.COMPENSATORY_MEAL,
      categorie: RecordCategorie.MEAL,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (GYM_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(token, GYM_REGEX);
    return {
      tokenType: TokenType.GYM,
      categorie: RecordCategorie.EXERCISE,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (STRENGTH_TRAINING_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(
      token,
      STRENGTH_TRAINING_REGEX
    );
    return {
      tokenType: TokenType.STRENGTH_TRAINING,
      categorie: RecordCategorie.EXERCISE,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  } else if (AEROBIC_EXERCISE_REGEX.test(token)) {
    const parts = separateMatchedAndRemainingParts(
      token,
      AEROBIC_EXERCISE_REGEX
    );
    return {
      tokenType: TokenType.AEROBIC_EXERCISE,
      categorie: RecordCategorie.EXERCISE,
      stringValue: parts.remainingPart,
      numberValue: undefined,
      unit: undefined,
    };
  }
  return {
    tokenType: TokenType.INDEFINITE,
    categorie: RecordCategorie.INDEFINITE,
    stringValue: undefined,
    numberValue: undefined,
    unit: undefined,
  };
}

function separateMatchedAndRemainingParts(str: string, regex: RegExp) {
  const match = str.match(regex);
  let result;

  if (match) {
    const matchedPart = match[0];
    const remainingPart = str.slice(matchedPart.length);

    result = {
      matchedPart: matchedPart,
      remainingPart: remainingPart,
    };
  } else {
    result = {
      matchedPart: null,
      remainingPart: str,
    };
  }
  return result;
}

function buildResponse(
  userId: string,
  message: string,
  timestamp: number
): { records: Record[]; message: string } {
  const tokens = message
    //.slice(0, 100) // primeiros 100 caracteres
    .split(/[.,]/) // separa tokens por acentos e pontos
    .filter((token) => token !== ""); // remove tokens vazios

  const records: Record[] = tokens?.map((dirtyToken) => {
    let token = sanitizeMessage(dirtyToken);
    let dirtyTime = undefined;

    const startsWithTimeH = separateMatchedAndRemainingParts(token, TIME_H);
    const startsWithTimeColon = separateMatchedAndRemainingParts(
      token,
      TIME_COLON
    );

    if (startsWithTimeH.matchedPart) {
      dirtyTime = startsWithTimeH.matchedPart;
      token = startsWithTimeH.remainingPart;
    } else if (startsWithTimeColon.matchedPart) {
      dirtyTime = startsWithTimeColon.matchedPart;
      token = startsWithTimeColon.remainingPart;
    }

    const date = new Date(timestamp * 1000);

    token = sanitizeMessage(token);
    return {
      createdAt: new Date(),
      date,
      userId,
      dirtyToken,
      token,
      dirtyTime,
      ...buildBaseRecord(token),
    };
  });

  return { records, message: print(records) };
}

function print(records: Record[]): string {
  return (
    "finalMessage: \n" +
    records
      ?.map(
        (record) =>
          `createdAt: ${record.createdAt}\ndate: ${record.date}\ndirtyToken: ${record.dirtyToken}\ntoken: ${record.token}\ndirtyTime: ${record.dirtyTime}\ntokenType: ${record.tokenType}\ncategorie: ${record.categorie}\nstringValue: ${record.stringValue}\nnumberValue: ${record.numberValue}\nunit: ${record.unit}`
      )
      ?.join(" \n\n")
  );
}

export default { buildResponse };
