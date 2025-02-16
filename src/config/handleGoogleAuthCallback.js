import jwt from "jsonwebtoken";
import User from "../models/User.js";

const handleGoogleAuthCallback = async (req, res) => {
  try {
    // Caută utilizatorul în baza de date după adresa de email.
    let user = await User.findOne({ email: req.user.email });

    // Dacă utilizatorul nu există, creează un cont nou pe baza informațiilor furnizate de Google.
    if (!user) {
      user = new User({
        name: req.user.displayName, // Numele utilizatorului obținut din datele Google.
        email: req.user.email, // Email-ul utilizatorului.
        googleId: req.user.id, // ID-ul unic al utilizatorului furnizat de Google.
      });
      await user.save(); // Salvează noul utilizator în baza de date.
    }

    // Creează un token JWT pentru autentificare.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token-ul expiră în 7 zile.
    });

    // Salvează token-ul într-un cookie HTTP-Only pentru securitate.
    res.cookie("token", token, {
      httpOnly: true, // Asigură că token-ul nu poate fi accesat prin JavaScript din browser.
      // secure: process.env.NODE_ENV === "production", // dezvoltare -- Folosește securitate sporită doar în producție (HTTPS).
      // sameSite: "strict", // dezvoltare -- Previne atacurile CSRF prin restricționarea utilizării cookie-urilor.

      secure: true, // Vercell -- Folosește true în producție (Vercel e HTTPS)
      sameSite: "none", // Vercell -- Permite cookie cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000, // Setează durata de viață a cookie-ului la 7 zile.
    });

    // Redirecționează utilizatorul către dashboard-ul aplicației după autentificare.
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    res.status(500).json({ message: "Eroare server!" });
  }
};

export default handleGoogleAuthCallback;
