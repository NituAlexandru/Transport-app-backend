import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import "./config/passport.js"; // Configurare Passport.js pentru Google
import routeOptimizer from "./routes/routeOptimizer.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Conectare la MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectat la MongoDB"))
  .catch((err) => console.error("❌ Eroare conectare MongoDB:", err));

// Rute
app.use("/", authRoutes);
app.use("/", googleAuthRoutes);
app.use("/", routeOptimizer);

// pentru local

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server pornit pe portul ${PORT}`));
export default app; // pentru vercell
