import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";

import authRoutes from "./routes/authRoute.js";
import billEntryRoutes from "./routes/billEntryRoutes.js";
import billingPartyRoutes from "./routes/billingPartyRoute.js";
import vehicelEntryRoutes from "./routes/vehicleEntryRoutes.js";
import balancePartyRoutes from "./routes/balancePartyRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ⛔ Use dynamic directory resolution for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Allow CORS for dev & prod
const corsOptions = {
  origin: [
    "https://divyanshiroadlines.com",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bill-entry", billEntryRoutes);
app.use("/api/billing-party", billingPartyRoutes);
app.use("/api/vehicle-entry", vehicelEntryRoutes);
app.use("/api/balance-party", balancePartyRoutes);

// ✅ Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.resolve(frontendPath, "index.html"));
    } else {
      next();
    }
  });
}

// ✅ Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});