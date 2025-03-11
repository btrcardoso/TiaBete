const axios = require("axios");
require("dotenv").config();

const IGNORE_REGEX = /^ignor.*/;
const INSULIN_NPH_REGEX = /^[0-9]+\s?(n|nph)$/;
const INSULIN_R_REGEX = /^[0-9]+\s?(r|reg|regular)$/;
const INSULIN_UR_REGEX = /^[0-9]+\s?(u\s?r|ultra\s?rapida|fiasp)$/;

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
  }

  return "INDEFINITE";
}

function buildResponse(userPhone, message) {
  if (typeof message !== "string") {
    return "Mensagem não suportada.";
  }

  const tokens = message
    .slice(0, 100) // primeiros 100 caracteres
    .split(/[.,]/) // separa tokens por acentos e pontos
    .filter((token) => token !== ""); // remove tokens vazios

  const data = tokens?.map((token) => {
    const sanitizedToken = sanitizeMessage(token);
    return { message: sanitizedToken, categorie: categorize(sanitizedToken) };
  });

  return (
    "finalMessage: \n" +
    data
      ?.map((info) => `message: ${info.message}\ncategorie: ${info.categorie}`)
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
