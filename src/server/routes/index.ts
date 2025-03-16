import { Router } from "express";
import UsersController from "../controllers/UsersController";

const router = Router();

router.get("/", (req, res) => {
  res.sendStatus(200);
});

router.post("/users/create", UsersController.create);

export { router };
