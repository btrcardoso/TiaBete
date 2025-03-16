import dotenv from "dotenv";
import { Categorie, Record } from "./RecordsService";
dotenv.config();

const TIME_H = /^([01]?[0-9]|2[0-3])h([0-5][0-9])?|^([01]?[0-9]|2[0-3])h/;
const TIME_COLON = /^([01]?[0-9]|2[0-3]):[0-5][0-9]/;

const IGNORE_REGEX = /^ignor/;
const SAVE_NOTE_REGEX = /^salv/;
const DELETE_REGEX = /^(excluir|delete|deletar)/;

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
const LUNCH_REGEX = /^almoc/;
const SNACK_REGEX = /^lanche/;
const DINNER_REGEX = /^jant/;
const FREE_MEAL_REGEX = /^refeicao\slivre/;
const COMPENSATORY_MEAL_REGEX = /^compens/;

const GYM_REGEX = /^(trein|acad(emia)?)/;
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

function categorize(message: string) {
  if (IGNORE_REGEX.test(message)) {
    return Categorie.IGNORE;
  } else if (SAVE_NOTE_REGEX.test(message)) {
    return Categorie.SAVE_NOTE;
  } else if (DELETE_REGEX.test(message)) {
    return Categorie.DELETE;
  } else if (INSULIN_NPH_REGEX.test(message)) {
    return Categorie.INSULIN_NPH;
  } else if (INSULIN_R_REGEX.test(message)) {
    return Categorie.INSULIN_R;
  } else if (INSULIN_UR_REGEX.test(message)) {
    return Categorie.INSULIN_UR;
  } else if (GLUCOSE_REGEX.test(message)) {
    return Categorie.GLUCOSE;
  } else if (SPELLED_HIGH_GLUCOSE_REGEX.test(message)) {
    return Categorie.SPELLED_HIGH_GLUCOSE;
  } else if (SPELLED_LOW_GLUCOSE_REGEX.test(message)) {
    return Categorie.SPELLED_LOW_GLUCOSE;
  } else if (BREAKFAST_REGEX.test(message)) {
    return Categorie.BREAKFAST;
  } else if (LUNCH_REGEX.test(message)) {
    return Categorie.LUNCH;
  } else if (SNACK_REGEX.test(message)) {
    return Categorie.SNACK;
  } else if (DINNER_REGEX.test(message)) {
    return Categorie.DINNER;
  } else if (FREE_MEAL_REGEX.test(message)) {
    return Categorie.FREE_MEAL;
  } else if (COMPENSATORY_MEAL_REGEX.test(message)) {
    return Categorie.COMPENSATORY_MEAL;
  } else if (GYM_REGEX.test(message)) {
    return Categorie.GYM;
  } else if (STRENGTH_TRAINING_REGEX.test(message)) {
    return Categorie.STRENGTH_TRAINING;
  } else if (AEROBIC_EXERCISE_REGEX.test(message)) {
    return Categorie.AEROBIC_EXERCISE;
  }
  return Categorie.INDEFINITE;
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

function buildResponse(userPhone: string, message: string): string {
  const tokens = message
    .slice(0, 100) // primeiros 100 caracteres
    .split(/[.,]/) // separa tokens por acentos e pontos
    .filter((token) => token !== ""); // remove tokens vazios

  const record = tokens?.map((dirtyToken) => {
    let token = sanitizeMessage(dirtyToken);
    let time = null;

    const startsWithTimeH = separateMatchedAndRemainingParts(token, TIME_H);
    const startsWithTimeColon = separateMatchedAndRemainingParts(
      token,
      TIME_COLON
    );

    if (startsWithTimeH.matchedPart) {
      time = startsWithTimeH.matchedPart;
      token = startsWithTimeH.remainingPart;
    } else if (startsWithTimeColon.matchedPart) {
      time = startsWithTimeColon.matchedPart;
      token = startsWithTimeColon.remainingPart;
    }

    token = sanitizeMessage(token);

    // todo: passar para tipo REcord
    return {
      dirtyToken,
      token,
      categorie: categorize(token),
      time,
    };
  });

  return (
    "finalMessage: \n" +
    record
      ?.map(
        (info) =>
          `dirtyToken: ${info.dirtyToken}\ntoken: ${info.token}\ncategorie: ${info.categorie}\ntime: ${info.time}`
      )
      ?.join(" \n\n")
  );
}

export default { buildResponse };
