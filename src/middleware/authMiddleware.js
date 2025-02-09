import jwt from "jsonwebtoken"; // Importă biblioteca jsonwebtoken pentru manipularea JWT-urilor

// Middleware pentru verificarea token-ului JWT
export const verifyToken = (req, res, next) => {
  // Preia token-ul din antetul Authorization al cererii (dacă există)
  const token = req.headers.authorization?.split(" ")[1];

  // Dacă token-ul nu există, trimite un răspuns cu status 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ message: "Token lipsă. Acces interzis!" });
  }

  try {
    // Verifică validitatea token-ului folosind cheia secretă
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Afișează conținutul token-ului decodat pentru depanare (opțional)
    console.log("Decoded JWT:", decoded);

    // Atribuie datele decodate ale utilizatorului (din token) obiectului `req`
    req.user = decoded;

    // Continuă cu următorul middleware sau rută
    next();
  } catch (error) {
    // Dacă token-ul nu este valid sau a expirat, trimite un răspuns cu status 403 (Forbidden)
    res.status(403).json({ message: "Token invalid!" });
  }
};
