import jwt from "jsonwebtoken";
import { ACCES_TOKEN } from "../config/config.js";

export const authRequired = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  jwt.verify(token, ACCES_TOKEN, (err, user) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    req.user = user;

    next();
  });
}