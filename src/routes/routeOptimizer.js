import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

//  **PUNCTE DE PLECARE/SOSIRE DEFAULT**
const DEFAULT_START = "Strada Industriilor 191, Chiajna 077041";
const DEFAULT_END = "Strada Industriilor 191, Chiajna 077041";

//  **Optimizăm traseul**
const getOptimizedRoute = async (points, start, end) => {
  try {
    console.log("🔍 Încep optimizarea rutei...");

    if (!start || !end) {
      throw new Error("Punctele de start și end sunt necesare!");
    }

    // Filtrăm doar punctele valide
    const validPoints = points.filter(
      (p) => p.address && p.address.trim() !== ""
    );

    console.log(
      "✅ Puncte intermediare:",
      validPoints.length > 0 ? validPoints : "Niciun punct intermediar"
    );

    // Construim parametrii pentru cererea API
    const params = {
      origin: start,
      destination: end,
      key: GOOGLE_MAPS_API_KEY,
      mode: "driving",
    };

    // Adăugăm waypoints DOAR dacă există puncte intermediare
    if (validPoints.length > 0) {
      params.waypoints = `optimize:true|${validPoints
        .map((wp) => wp.address)
        .join("|")}`;
    }

    console.log("📤 Trimit cerere către Google Directions API:", params);

    // Apel către Google Directions API
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      { params }
    );

    console.log("📥 Răspuns API Directions:", response.data);

    if (!response.data || response.data.status !== "OK") {
      throw new Error(`Eroare API Directions: ${response.data.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("❌ Eroare generare rută:", error);
    throw error;
  }
};

// **Endpoint API pentru optimizarea rutei** (Păstrat tot, doar am adăugat verificarea pentru default start/end!)
router.post("/optimize-route", async (req, res) => {
  try {
    console.log("📥 Cerere primită la /optimize-route:", req.body);

    let { points, start, end } = req.body;

    // **Dacă nu sunt setate, folosim DEFAULT**
    start = start || DEFAULT_START;
    end = end || DEFAULT_END;

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Punctele de start și destinație sunt necesare!" });
    }

    // Dacă `points` nu există sau e gol, setează-l ca un array gol
    if (!Array.isArray(points) || points.length === 0) {
      points = [];
    }

    const optimizedRoute = await getOptimizedRoute(points, start, end);
    res.json(optimizedRoute);
  } catch (error) {
    console.error("❌ Eroare la optimizarea traseului:", error);
    res.status(500).json({ message: "Eroare la optimizarea traseului!" });
  }
});

export default router;
