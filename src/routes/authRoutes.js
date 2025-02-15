import { Router } from "express";
import User from "../models/User.js"; // ✅ Importă modelul User
import { register, login, logout } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// ✅ Rută protejată corectată
router.get("/protected-route", verifyToken, async (req, res) => {
  try {
    console.log("🔹 Utilizator logat:", req.user); // Debugging

    const user = await User.findById(req.user.id).select("name email");

    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    res.json({ message: "Acces permis!", user });
  } catch (error) {
    console.error("❌ Eroare la obținerea utilizatorului:", error);
    res.status(500).json({ message: "Eroare server!" });
  }
});

export default router;
