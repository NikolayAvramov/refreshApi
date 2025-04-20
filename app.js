import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/users", userRoutes);
app.use("/markets", marketRoutes);
app.use("/markets", productRoutes);

export default app;
