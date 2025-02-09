import bcrypt from "bcryptjs"; // Importă biblioteca bcrypt pentru hashing-ul parolelor
import jwt from "jsonwebtoken"; // Importă biblioteca jsonwebtoken pentru crearea și verificarea token-urilor JWT
import User from "../models/User.js"; // Importă modelul User pentru interacțiunea cu baza de date

// Controller pentru înregistrarea utilizatorilor
export const register = async (req, res) => {
  try {
    // Preia datele din cererea clientului
    const { name, email, password } = req.body;

    // Verifică dacă utilizatorul există deja în baza de date pe baza email-ului
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email-ul este deja folosit!" }); // Răspunde cu o eroare dacă email-ul este deja utilizat
    }

    // Hash-ul parolei pentru a proteja datele utilizatorului
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creează un nou utilizator cu datele primite
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save(); // Salvează utilizatorul în baza de date

    // Trimite un răspuns de succes
    res.status(201).json({ message: "Utilizator creat cu succes!" });
  } catch (error) {
    // Răspunde cu o eroare de server în caz de probleme
    res.status(500).json({ message: "Eroare server" });
  }
};

// Controller pentru autentificarea utilizatorilor
export const login = async (req, res) => {
  try {
    // Preia email-ul și parola din cerere
    const { email, password } = req.body;

    // Verifică dacă utilizatorul există în baza de date
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email sau parolă greșită!" }); // Răspunde cu o eroare dacă utilizatorul nu există
    }

    // Compară parola introdusă cu hash-ul din baza de date
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email sau parolă greșită!" }); // Răspunde cu o eroare dacă parola nu se potrivește
    }

    // Creează un token JWT care conține ID-ul utilizatorului
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token-ul expiră în 7 zile
    });

    // Trimite un răspuns cu mesajul de succes, token-ul și datele utilizatorului
    res.json({
      message: "Autentificare reușită!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    // Răspunde cu o eroare de server în caz de probleme
    res.status(500).json({ message: "Eroare server" });
  }
};

// Controller pentru deconectarea utilizatorilor
export const logout = (req, res) => {
  // Șterge cookie-ul care conține token-ul pentru securitate
  res.clearCookie("token", {
    httpOnly: true, // Asigură că cookie-ul este accesibil doar prin HTTP (nu de către JavaScript)
    secure: process.env.NODE_ENV === "production", // Cookie-ul este trimis doar prin HTTPS în producție
    sameSite: "strict", // Previne transmiterea cookie-ului către alte site-uri
  });

  // Trimite un răspuns de succes
  res.status(200).json({ message: "Deconectare reușită!" });
};
