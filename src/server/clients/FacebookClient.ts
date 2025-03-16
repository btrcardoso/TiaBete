import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function send(
  fromId: string,
  destinationNumber: string,
  messageText: string
) {
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
    console.error("Houve um erro ao enviar a mensagem: ", error);
  }
}

export default { send };
