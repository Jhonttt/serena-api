import jwt from "jsonwebtoken";
import { TOKEN_SECRET, TOKEN_EXPIRATION } from "../config/config.js";

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION }, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};