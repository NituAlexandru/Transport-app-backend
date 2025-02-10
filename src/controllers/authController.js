import bcrypt from "bcryptjs"; // Importă bcryptjs pentru criptarea parolelor.
import jwt from "jsonwebtoken"; // Importă jsonwebtoken pentru generarea token-urilor JWT.
import User from "../models/User.js"; // Importă modelul User pentru interacțiunea cu baza de date.

// Funcția pentru înregistrarea unui utilizator nou.
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; // Extrage datele de înregistrare din corpul cererii.

    // Verifică dacă există deja un utilizator cu acest email.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email-ul este deja folosit!" });
    }

    // Criptează parola utilizatorului înainte de salvare.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creează un nou utilizator și îl salvează în baza de date.
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Utilizator creat cu succes!" }); // Răspunde cu un mesaj de succes.
  } catch (error) {
    res.status(500).json({ message: "Eroare server!" }); // Răspunde cu o eroare dacă apare o problemă pe server.
  }
};

// Funcția pentru autentificarea unui utilizator.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // Extrage email-ul și parola din corpul cererii.

    // Caută utilizatorul în baza de date după email.
    const user = await User.findOne({ email });

    // Verifică dacă utilizatorul există și dacă parola este corectă.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Email sau parolă greșită!" });
    }

    // Generează un token JWT pentru utilizator.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token-ul expiră în 7 zile.
    });

    // Stochează token-ul într-un cookie HTTP-Only pentru securitate.
    res.cookie("token", token, {
      httpOnly: true, // Asigură că token-ul nu poate fi accesat din JavaScript în browser.
      secure: process.env.NODE_ENV === "production", // Utilizează securitate sporită în producție (HTTPS).
      sameSite: "strict", // Previne atacurile CSRF prin restricționarea accesului la cookie.
      maxAge: 7 * 24 * 60 * 60 * 1000, // Setează durata de viață a cookie-ului la 7 zile.
    });

    res.status(200).json({ message: "Autentificare reușită!" }); // Răspunde cu un mesaj de succes.
  } catch (error) {
    res.status(500).json({ message: "Eroare server!" }); // Răspunde cu o eroare dacă apare o problemă pe server.
  }
};

// Funcția pentru deconectarea utilizatorului.
export const logout = (req, res) => {
  res.clearCookie("token"); // Șterge cookie-ul token pentru a invalida sesiunea utilizatorului.
  res.status(200).json({ message: "Deconectare reușită!" }); 
};
