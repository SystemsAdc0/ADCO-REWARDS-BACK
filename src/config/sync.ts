import dotenv from "dotenv";
dotenv.config();

import sequelize from "./database";
import "../models"; 

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Tablas sincronizadas correctamente.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error al sincronizar:", err);
    process.exit(1);
  });
