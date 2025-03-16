import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";

//import providers from "./providers.js";
import chat from "./chat/index.js";
// import media from "./media/index.js";
//import file from "./utils/file.js";
//import time from "./utils/converTime.js";
import feedbacks from "./feedbacks/feedbacks.js";
import mongodb from "./mongoDB/index.js";

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.sendStatus(200);
});

app.get("/webhook", function (req, res) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == process.env.FB_VERIFICATION_TOKEN
  ) {
    res.send(req.query["hub.challenge"]);
    console.log("Facebook verificou a URL");
  } else {
    res.sendStatus(400);
  }
});

app.post("/users/create", async function (req, res) {
  try {
    const userJson = {
      name: req.body.name,
      phone: req.body.phone,
    };
    console.log(userJson);
    await mongodb.createUser(userJson);

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/webhook", async function (request, response) {
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
        msgText = chat.text.buildResponse(messageFrom, messageContent);
      } else {
        console.warn("API inconsistente");
        msgText = "Ainda estou aprendendo a responder esse tipo de mensagem.";
      }
      chat.text.send(ourNumberId, messageFrom, msgText);
    }

    response.sendStatus(200); //TODO descomentar
    //response.send(msgText).status(200);
  } else {
    response.sendStatus(400);
  }
});

// app.post("/webhook", async function (request, response) {
//   console.log("Incoming webhook: " + JSON.stringify(request.body));
//   if (
//     request.body.entry &&
//     request.body.entry[0].changes &&
//     request.body.entry[0].changes[0] &&
//     request.body.entry[0].changes[0].value.messages &&
//     request.body.entry[0].changes[0].value.messages[0]
//   ) {
//     let messageType = request.body.entry[0].changes[0].value.messages[0].type;
//     let messageFrom = request.body.entry[0].changes[0].value.messages[0].from;
//     let messageTimeStamp =
//       request.body.entry[0].changes[0].value.messages[0].timestamp;
//     let ourNumberId =
//       request.body.entry[0].changes[0].value.metadata.phone_number_id;
//     let status = request.body.entry[0].changes[0].statuses;
//     let contactName =
//       request.body.entry[0].changes[0].value.contacts[0].profile.name;
//     let msgText;
//     if (!status) {
//       if (messageType == "text") {
//         let messageContent =
//           request.body.entry[0].changes[0].value.messages[0].text.body;
//         if (
//           messageContent.includes("Oi, TiaBete. É a minha primeira vez aqui!")
//         ) {
//           const user = await mongodb.getUser(messageFrom);
//           //if verifyUser send oi, usuário
//           if (user) {
//             msgText = `Bem-vindo de volta, ${user.name}!`;
//             chat.text.send(ourNumberId, messageFrom, msgText);
//           } else {
//             const userJson = {
//               name: contactName,
//               phone: messageFrom,
//             };
//             await mongodb.createUser(userJson);
//             msgText = `Olá, *${userJson.name}*!\n\nSou a *TiaBete*, sua parceira para o controle do diabetes! Estou aqui para te ajudar a acompanhar sua alimentação, medicamentos, exercícios e glicose no sangue.\n\nVamos juntos tornar o gerenciamento do diabetes mais fácil, barato e tranquilo.\n\nVocê pode me dizer tudo o que pode impactar em seu índice glicêmico, como por exemplo:\n\n- *Alimentação:* "Comi macarronada agora"\n- *Exercícios físicos:* "Fiz 30 minutos de natação"\n- *Glicemia:* "Minha glicose está em 100mg/dL"\n- *Medicamentos:* "Tomei uma dose de insulina"\n\nVocê pode me mandar em *áudio* se preferir. 🔊`;

//             chat.text.send(ourNumberId, messageFrom, msgText);
//           }
//           //else criar usuário e send onboarding
//         } else {
//           console.log(messageContent);
//           let jsonResult = await chat.chatGptService.categorize(
//             messageTimeStamp,
//             messageContent
//           );
//           msgText = await feedbacks.getFeedbackMessage(jsonResult);
//           chat.text.send(ourNumberId, messageFrom, msgText);
//         }
//       } else if (messageType == "audio") {
//         let mediaId =
//           request.body.entry[0].changes[0].value.messages[0].audio.id;
//         let messageContent = await media.mediaService.getFileAndTranscribe(
//           mediaId
//         );
//         let jsonResult = await chat.chatGptService.categorize(
//           messageTimeStamp,
//           messageContent
//         );
//         msgText = await feedbacks.getFeedbackMessage(jsonResult);
//         chat.text.send(ourNumberId, messageFrom, msgText);
//       } else {
//         console.log("API inconsistente");
//         msgText = "Ainda estou aprendendo a responder esse tipo de mensagem.";
//         chat.text.send(ourNumberId, messageFrom, msgText);
//       }
//     }
//     response.sendStatus(200);
//   } else {
//     response.sendStatus(400);
//   }
// });

/**
 * Endpoints de teste
 */
// app.get("/transcreva/:id", async function (req, res) {
//   try {
//     let mediaId = req.params.id;
//     result = await media.mediaService.getFileAndTranscribe(mediaId);
//     res.send(result);
//   } catch (e) {
//     res.sendStatus(500);
//   }
// });

app.get("/chatgpt", async function (req, res) {
  try {
    let message = req.body.message;
    let messageTimestamp = req.body.messageTimestamp;
    let jsonResult = await chat.chatGptService.categorize(
      messageTimestamp,
      message
    );
    console.log("Json de resultado", jsonResult);
    let formattedMessage = await feedbacks.getFeedbackMessage(jsonResult);
    res.send(formattedMessage);
  } catch (e) {
    res.sendStatus(500);
  }
});

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
