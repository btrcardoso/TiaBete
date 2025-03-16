import { Router } from "express";
import UsersController from "../controllers/UsersController";
import WebhooksController from "../controllers/WebhooksController";

const router = Router();

router.get("/", (req, res) => {
  res.sendStatus(200);
});

router.get("/webhook", WebhooksController.verify);
router.post("/webhook", WebhooksController.receiveAndSendMessage);

router.post("/users/create", UsersController.create);

export { router };
