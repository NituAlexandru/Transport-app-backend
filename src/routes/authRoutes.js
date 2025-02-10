import { Router } from "express";
import { register, login, logout } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Rută protejată
router.get("/protected-route", verifyToken, (req, res) => {
  res.json({ message: "Acces permis!", user: req.user });
});

export default router;
