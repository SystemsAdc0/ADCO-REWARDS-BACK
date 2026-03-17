import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import sequelize from "./config/database";
import "./models"; // cargar asociaciones

// Rutas
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import prizeRoutes from "./routes/prizes";
import redemptionRoutes from "./routes/redemptions";
import activityRoutes from "./routes/activities";
import pointRoutes from "./routes/points";
import notificationRoutes from "./routes/notifications";
import reportRoutes from "./routes/reports";
import googleFiles from "./routes/googleCloud";
import agreements from "./routes/Agreements";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(
  cors({
    origin: "https://lkn26fdp-5173.usw3.devtunnels.ms",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const color =
      res.statusCode >= 500
        ? "\x1b[31m" // rojo
        : res.statusCode >= 400
          ? "\x1b[33m" // amarillo
          : res.statusCode >= 300
            ? "\x1b[36m" // cyan
            : "\x1b[32m"; // verde
    process.stdout.write(
      `${color}${req.method}\x1b[0m ${req.originalUrl} \x1b[90m→ ${res.statusCode} (${ms}ms)\x1b[0m\n`,
    );
  });
  next();
});

// Servir imagenes subidas
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads")),
);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prizes", prizeRoutes);
app.use("/api/redemptions", redemptionRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/file", googleFiles);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/agreements", agreements);
// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

// Iniciar servidor
async function start() {
  try {
    await sequelize.authenticate();
    console.log("Conexion a MySQL establecida.");

    // await sequelize.sync({ alter: true });
    await sequelize.sync({ force: true });
    console.log("Modelos sincronizados.");
    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Puerto ${PORT} ya está en uso. Mata el proceso anterior.`,
        );
      } else {
        console.error("Error en el servidor:", err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Error al iniciar:", error);
    process.exit(1);
  }
}

start();
