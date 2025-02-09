import { Router } from "express";
import { register, login, logout } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Rută protejată - accesibilă doar utilizatorilor autentificați
router.get("/protected-route", verifyToken, async (req, res) => {
  try {
    console.log("Request user:", req.user); // Debug: afișează utilizatorul extras din tokenul JWT
    const user = await User.findById(req.user.id); // Caută utilizatorul în baza de date folosind `id` din token
    if (!user) {
      // Dacă utilizatorul nu există, returnează o eroare 404
      return res.status(404).json({ message: "Utilizator inexistent!" });
    }
    // Dacă utilizatorul este găsit, trimite datele sale către client
    res.json({
      message: "Acces permis!",
      user: { id: user._id, name: user.name, email: user.email }, // Returnează ID-ul, numele și email-ul
    });
  } catch (error) {
    // În cazul unei erori de server, trimite o eroare 500
    res.status(500).json({ message: "Eroare server!" });
  }
});

export default router;
