import dotenv from "dotenv";
dotenv.config();
import sequelize from "./database";
import { User, Activity, ActivityEntry, PointHistory } from "../models";

async function seedParticipants() {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la base de datos.");

    const users = await User.findAll({
      where: { role: "user" },
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
    });

    const activities = await Activity.findAll({
      attributes: ["id", "name", "points_reward"],
      order: [["id", "ASC"]],
    });

    if (users.length === 0) {
      console.error("No hay usuarios. Corre el seeder principal primero.");
      process.exit(1);
    }
    if (activities.length === 0) {
      console.error("No hay actividades. Corre el seeder principal primero.");
      process.exit(1);
    }

    const admin = await User.findOne({ where: { role: "admin" } });

    // Distribución de participaciones por usuario
    // Cada tupla: [user_index, activity_index, status]
    type EntryStatus = "approved" | "rejected" | "pending";
    const plan: [number, number, EntryStatus][] = [
      // Usuario 0 — muchas aprobadas (líder)
      [0, 0, "approved"], [0, 1, "approved"], [0, 2, "approved"],
      [0, 0, "approved"], [0, 1, "approved"],
      // Usuario 1 — segundo lugar
      [1, 0, "approved"], [1, 1, "approved"], [1, 2, "approved"],
      [1, 0, "rejected"],
      // Usuario 2 — tercer lugar
      [2, 0, "approved"], [2, 1, "approved"], [2, 2, "approved"],
      [2, 1, "pending"],
      // Usuario 3
      [3, 0, "approved"], [3, 1, "approved"], [3, 2, "pending"],
      // Usuario 4
      [4, 0, "approved"], [4, 1, "approved"], [4, 2, "rejected"],
      // Usuario 5
      [5, 0, "approved"], [5, 1, "pending"],
      // Usuario 6
      [6, 0, "approved"], [6, 1, "rejected"],
      // Usuario 7
      [7, 0, "pending"],
    ];

    const entries = plan
      .filter(([ui, ai]) => ui < users.length && ai < activities.length)
      .map(([ui, ai, status]) => ({
        user_id: users[ui].id,
        activity_id: activities[ai % activities.length].id,
        file: `seed-test-${users[ui].id}-${activities[ai % activities.length].id}.pdf`,
        status,
        reviewed_by: status !== "pending" ? admin?.id ?? null : null,
        review_notes:
          status === "approved"
            ? "Participación válida."
            : status === "rejected"
            ? "No cumple los requisitos."
            : null,
      }));

    await ActivityEntry.bulkCreate(entries as any[]);
    console.log(`✓ ${entries.length} participaciones creadas.`);

    // Crear historial de puntos para las aprobadas
    const approved = plan.filter(([ui, ai, s]) => s === "approved" && ui < users.length && ai < activities.length);
    const pointEntries = approved.map(([ui, ai]) => ({
      user_id: users[ui].id,
      points: activities[ai % activities.length].dataValues.points_reward,
      action: "earned",
      description: `Actividad aprobada: ${activities[ai % activities.length].dataValues.name}`,
      assigned_by: admin?.id ?? null,
    }));

    await PointHistory.bulkCreate(pointEntries as any[]);
    console.log(`✓ ${pointEntries.length} registros de puntos creados.`);

    console.log("\n=== SEED PARTICIPANTES COMPLETADO ===");
    console.log("Ranking esperado (por aprobadas):");
    const summary: Record<number, number> = {};
    approved.forEach(([ui]) => { summary[ui] = (summary[ui] ?? 0) + 1; });
    Object.entries(summary)
      .sort(([, a], [, b]) => b - a)
      .forEach(([ui, count]) => {
        const u = users[Number(ui)];
        if (u) console.log(`  ${u.dataValues.name}: ${count} aprobadas`);
      });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seedParticipants();
