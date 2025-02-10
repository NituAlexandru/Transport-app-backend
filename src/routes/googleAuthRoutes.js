import { Router } from "express";
import passport from "passport";
import handleGoogleAuthCallback from "../config/handleGoogleAuthCallback.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  handleGoogleAuthCallback
);

export default router;
