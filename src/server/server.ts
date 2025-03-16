import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { router } from "./routes";

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

app.use(router);

export { app };
