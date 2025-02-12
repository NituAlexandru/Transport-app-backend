import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const DEFAULT_START = "Strada Industriilor 191, Chiajna 077041";
const DEFAULT_END = "Strada Industriilor 191, Chiajna 077041";

// 🔵 Optimizăm traseul și returnăm ordinea punctelor
const getOptimizedRoute = async (points, start, end) => {
  const validPoints = points.filter(
    (p) => p.address && p.address.trim() !== ""
  );
  const waypoints =
    validPoints.length > 0 ? validPoints.map((wp) => wp.address).join("|") : "";

  const params = {
    origin: start,
    destination: end,
    key: GOOGLE_MAPS_API_KEY,
    mode: "driving",
  };

  if (waypoints) {
    params.waypoints = `optimize:true|${waypoints}`;
  }

  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/directions/json",
    { params }
  );

  if (!response.data || response.data.status !== "OK") {
    throw new Error(`Eroare API Directions: ${response.data.status}`);
  }

  return response.data.routes[0].waypoint_order.map(
    (index) => validPoints[index]?.address
  );
};

// 🔵 Obținem durata fiecărui segment cu și fără trafic
const getSegmentDuration = async (origin, destination, departureTimestamp) => {
  const params = {
    origin,
    destination,
    key: GOOGLE_MAPS_API_KEY,
    mode: "driving",
    departure_time: departureTimestamp || "now",
    traffic_model: "best_guess",
  };

  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/directions/json",
    { params }
  );

  if (!response.data || response.data.status !== "OK") {
    throw new Error(`Eroare API Directions: ${response.data.status}`);
  }

  const leg = response.data.routes[0].legs[0];

  console.log(`🔹 Segment: ${origin} → ${destination}`);
  console.log(`   🏁 Distanța: ${leg.distance.text}`);
  console.log(`   ⏳ Durata fără trafic: ${leg.duration.text}`);
  console.log(
    `   🚦 Durata cu trafic: ${
      leg.duration_in_traffic?.text || leg.duration.text
    }`
  );

  return {
    etaWithoutTraffic: leg.duration.value,
    etaWithTraffic: leg.duration_in_traffic?.value || leg.duration.value,
    distance: leg.distance.value / 1000, // Convertim în km
  };
};

// 🔵 Optimizăm traseul și calculăm ETA total
const calculateOptimizedETA = async (
  points,
  start,
  end,
  departureTimestamp
) => {
  const orderedPoints = await getOptimizedRoute(points, start, end);
  let totalETAWithoutTraffic = 0;
  let totalETAWithTraffic = 0;
  let totalDistance = 0;
  let lastPoint = start;

  console.log("🚀 Încep calculul ETA pentru fiecare segment:");

  for (const point of [...orderedPoints, end]) {
    const { etaWithoutTraffic, etaWithTraffic, distance } =
      await getSegmentDuration(lastPoint, point, departureTimestamp);
    totalETAWithoutTraffic += etaWithoutTraffic;
    totalETAWithTraffic += etaWithTraffic;
    totalDistance += distance;
    lastPoint = point;
  }

  console.log(
    `✅ ETA total fără trafic: ${formatTime(totalETAWithoutTraffic)}`
  );
  console.log(`✅ ETA total cu trafic: ${formatTime(totalETAWithTraffic)}`);
  console.log(`📏 Distanța totală: ${totalDistance.toFixed(1)} km`);

  return {
    eta_no_traffic: formatTime(totalETAWithoutTraffic),
    eta_with_traffic: formatTime(totalETAWithTraffic),
    distance_total: `${totalDistance.toFixed(1)} km`,
    orderedPoints,
  };
};

// 🔵 Funcție pentru formatul HH:mm
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours} ore ${minutes} min` : `${minutes} min`;
};

// 🔵 Endpoint API
router.post("/optimize-route", async (req, res) => {
  try {
    let { points, start, end, departureTime } = req.body;
    start = start || DEFAULT_START;
    end = end || DEFAULT_END;

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Punctele de start și destinație sunt necesare!" });
    }

    let departureTimestamp = departureTime
      ? Math.floor(new Date(departureTime).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    const { eta_no_traffic, eta_with_traffic, distance_total, orderedPoints } =
      await calculateOptimizedETA(points, start, end, departureTimestamp);

    res.json({
      eta_no_traffic,
      eta_with_traffic,
      distance_total,
      orderedPoints,
    });
  } catch (error) {
    console.error("❌ Eroare la optimizarea traseului:", error);
    res.status(500).json({ message: "Eroare la optimizarea traseului!" });
  }
});

export default router;
