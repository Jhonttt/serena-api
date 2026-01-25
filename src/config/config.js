import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const PORT = process.env.PORT || 3000;
export const DB_NAME = process.env.DB_NAME;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_HOST = process.env.DB_HOST;
export const DB_DIALECT = process.env.DB_DIALECT;

export const ACCES_TOKEN = process.env.JWT_ACCESS_SECRET;
export const ACCES_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION;