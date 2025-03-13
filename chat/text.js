const axios = require("axios");
require("dotenv").config();

const TIME_H = /^([01]?[0-9]|2[0-3])h([0-5][0-9])?|^([01]?[0-9]|2[0-3])h/;
const TIME_COLON = /^([01]?[0-9]|2[0-3]):[0-5][0-9]/;

const IGNORE_REGEX = /^ignor.*/;
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
const COMPENSATORY_MEAL_REGEX = /^compens/;

function sanitizeMessage(message) {
  return message
    .toLowerCase() // Converte para minúsculas
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, " ") // Substitui múltiplos espaços por um único
    .trim(); // Remove espaços extras no início e fim
}

function categorize(message) {
  if (IGNORE_REGEX.test(message)) {
    return "IGNORE";
  } else if (INSULIN_NPH_REGEX.test(message)) {
    return "INSULIN_NPH";
  } else if (INSULIN_R_REGEX.test(message)) {
    return "INSULIN_R";
  } else if (INSULIN_UR_REGEX.test(message)) {
    return "INSULIN_UR";
  } else if (GLUCOSE_REGEX.test(message)) {
    return "GLUCOSE";
  } else if (SPELLED_HIGH_GLUCOSE_REGEX.test(message)) {
    return "SPELLED_HIGH_GLUCOSE";
  } else if (SPELLED_LOW_GLUCOSE_REGEX.test(message)) {
    return "SPELLED_LOW_GLUCOSE";
  } else if (BREAKFAST_REGEX.test(message)) {
    return "BREAKFAST";
  } else if (LUNCH_REGEX.test(message)) {
    return "LUNCH";
  } else if (SNACK_REGEX.test(message)) {
    return "SNACK";
  } else if (DINNER_REGEX.test(message)) {
    return "DINNER";
  } else if (COMPENSATORY_MEAL_REGEX.test(message)) {
    return "COMPENSATORY_MEAL";
  }

  return "INDEFINITE";
}

function separateMatchedAndRemainingParts(str, regex) {
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

function buildResponse(userPhone, message) {
  if (typeof message !== "string") {
    return "Mensagem não suportada.";
  }

  const tokens = message
    .slice(0, 100) // primeiros 100 caracteres
    .split(/[.,]/) // separa tokens por acentos e pontos
    .filter((token) => token !== ""); // remove tokens vazios

  const data = tokens?.map((dirtyToken) => {
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

    return {
      dirtyToken,
      token,
      categorie: categorize(token),
      time,
    };
  });

  return (
    "finalMessage: \n" +
    data
      ?.map(
        (info) =>
          `dirtyToken: ${info.dirtyToken}\ntoken: ${info.token}\ncategorie: ${info.categorie}\ntime: ${info.time}`
      )
      ?.join(" \n\n")
  );
}

async function send(fromId, destinationNumber, messageText) {
  if (process.env.ENV === "DEV") {
    console.log(
      `Enviando mensagem de ${fromId} para ${destinationNumber}: ${messageText}`
    );
    return;
  }
  try {
    let message = await axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.FB_API_VERSION}/${fromId}/messages`,
      data: {
        messaging_product: "whatsapp",
        to: destinationNumber,
        text: { body: messageText },
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FB_API_TOKEN}`,
      },
    });
    console.log("Mensagem respondida");
    return message;
  } catch (error) {
    console.log("Houve um erro ao enviar a mensagem");
    console.log(error);
  }
}

module.exports = { send, buildResponse };
