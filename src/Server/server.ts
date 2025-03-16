import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";

//import providers from "./providers.js";
// import chat from "./chat/index.js";
// // import media from "./media/index.js";
// //import file from "./utils/file.js";
// //import time from "./utils/converTime.js";
// import feedbacks from "./feedbacks/feedbacks.js";
// import mongodb from "./mongoDB/index.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
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

export { app };
