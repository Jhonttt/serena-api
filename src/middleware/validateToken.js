import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config/config.js";

export const authRequired = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json(["No token, authorization denied"]);

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).json(["Invalid token"]);

    req.user = user;

    next();
  });
}