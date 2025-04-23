import http from "http";
import app from "./app.js"; // Importing app using ES module syntax
import dotenv from "dotenv";
dotenv.config();

console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

const port = process.env.PORT;

const server = http.createServer(app);

server.listen(port, () => console.log(`Server listening on port ${port}`));
