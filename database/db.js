import pkg from "pg" ;

const { Client } = pkg;

export const database = new Client({
    host: process.env.DB_HOST,
    database: "evocartdb",
    user: "postgres",
    password: "shirin",
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