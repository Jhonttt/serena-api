import jwt from "jsonwebtoken";
import { ACCES_TOKEN, ACCES_EXPIRATION } from "../config/config.js";

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, ACCES_TOKEN, { expiresIn: ACCES_EXPIRATION }, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};