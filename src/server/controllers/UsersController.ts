import { Request, Response } from "express";
import UsersService from "../services/UsersService";

async function create(req: Request, res: Response) {
  try {
    const userJson = {
      name: req.body.name,
      phone: req.body.phone,
    };
    console.log("Criando usuário: ", userJson);
    await UsersService.createUser(userJson);
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
}

export default { create };
