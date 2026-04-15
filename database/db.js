import pkg from "pg" ;

const { Client } = pkg;

import { config } from "dotenv";
config({path: './config/config.env'});

export const database = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

try {
    await database.connect();
    console.log("Connected to the database successfully.");
} catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
}

export default database;