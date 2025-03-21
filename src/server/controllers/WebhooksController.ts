import { Request, Response } from "express";
import TextService from "../services/TextService";
import FacebookClient from "../clients/FacebookClient";
import UsersService from "../services/UsersService";
import RecordsService from "../services/RecordsService";

function verify(req: Request, res: Response) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == process.env.FB_VERIFICATION_TOKEN
  ) {
    res.send(req.query["hub.challenge"]);
    console.log("Facebook verificou a URL");
  } else {
    res.sendStatus(400);
  }
}

async function receiveAndSendMessage(request: Request, response: Response) {
  try {
    console.log("Incoming webhook: " + JSON.stringify(request.body));

    const firstEntry = request.body.entry ? request.body.entry[0] : undefined;
    const firstChange = firstEntry?.changes ? firstEntry.changes[0] : undefined;
    const statuses = firstChange?.statuses;
    const value = firstChange?.value;

    const ourNumberId = value?.metadata?.phone_number_id;
    const message = value?.messages ? value.messages[0] : undefined;
    const contactName = value?.contacts
      ? value.contacts[0]?.profile?.name
      : undefined;

    if (message && ourNumberId) {
      const messageType = message.type;
      const messageFrom = message.from;
      const messageTimeStamp = message.timestamp;
      let msgText;

      if (!statuses) {
        if (messageType == "text") {
          let messageContent = message?.text?.body;
          let userId: string | undefined = (
            await UsersService.getUser(messageFrom)
          )?._id;
          if (userId) {
            const buildedResponse = TextService.buildResponse(
              userId,
              messageContent,
              messageTimeStamp
            );
            await RecordsService.insertRecords(buildedResponse.records);
            msgText = buildedResponse.message;
          } else {
            console.warn("Usuário não cadastrado chamado a api");
            msgText = "Usuário precisa fazer cadastro!";
          }
        } else {
          console.warn("API inconsistente");
          msgText = "Ainda estou aprendendo a responder esse tipo de mensagem.";
        }
        FacebookClient.send(ourNumberId, messageFrom, msgText);
      }

      // response.sendStatus(200); //TODO descomentar
      response.send(msgText).status(200);
    } else {
      response.sendStatus(400);
    }
  } catch (err) {
    console.error("Erro no webhook de recebimento e envio de mensagem. ");
    response.sendStatus(400);
  }
}

export default { verify, receiveAndSendMessage };
