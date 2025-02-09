import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express(); // Creează o aplicație Express

// Middleware
app.use(express.json()); // Parsează cererile cu corp JSON
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Permite cereri doar de la URL-ul specificat în `.env`
    credentials: true, // Activează trimiterea cookie-urilor și altor acreditive
  })
);
app.use(helmet()); // Adaugă anteturi HTTP pentru a proteja aplicația de atacuri comune
app.use(morgan("dev")); // Loghează cererile HTTP în consola serverului
app.use(cookieParser()); // Permite manipularea și accesarea cookie-urilor

// Conectare la MongoDB
mongoose
  .connect(process.env.MONGO_URI) // Conectare la baza de date MongoDB folosind URI-ul din `.env`
  .then(() => console.log("✅ Conectat la MongoDB")) // Afișează un mesaj de succes în caz de conectare reușită
  .catch((err) => console.error("❌ Eroare conectare MongoDB:", err)); // Afișează un mesaj de eroare în caz de eșec

// Rute
app.use("/", authRoutes); // Asociază toate rutele definite în `authRoutes.js` la baza URL-ului "/"

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server pornit pe portul ${PORT}`));
