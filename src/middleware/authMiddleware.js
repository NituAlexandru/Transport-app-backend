import jwt from "jsonwebtoken"; 

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Extrage token-ul JWT din cookie-urile cererii.

  // Verifică dacă token-ul există.
  if (!token) {
    return res.status(401).json({ message: "Token lipsă. Acces interzis!" }); // Returnează un mesaj de eroare dacă token-ul nu este prezent.
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifică și decodează token-ul folosind cheia secretă din variabilele de mediu.
    req.user = decoded; // Stochează informațiile decodificate ale utilizatorului în obiectul req pentru a fi accesibile în rutele următoare.
    next(); // Permite trecerea la următoarea funcție middleware sau rută.
  } catch (error) {
    res.status(403).json({ message: "Token invalid!" }); // Returnează un mesaj de eroare dacă token-ul este invalid sau expirat.
  }
};
