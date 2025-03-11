const axios = require("axios");
require("dotenv").config();

const IGNORE_REGEX = "ignor/";

function sanitizeMessage(message) {
  return message
    .toLowerCase() // Converte para minúsculas
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, " ") // Substitui múltiplos espaços por um único
    .trim(); // Remove espaços extras no início e fim
}

function categorize(message) {
  // if (IGNORE_REGEX.test(message)) {
  //   return "IGNORE";
  // }

  return "INDEFINITE";
}

function buildResponse(userPhone, message) {
  if (typeof message !== "string") {
    return "Mensagem não suportada.";
  }

  const tokens = sanitizeMessage(message.slice(0, 100))
    .split(/[.,]/) //separa tokens por acentos e pontos
    .filter((token) => token !== ""); //remove tokens vazios

  const data = tokens?.map((token) => {
    return { message: token, categorie: categorize(token) };
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
