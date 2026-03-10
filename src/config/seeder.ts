import dotenv from "dotenv";
dotenv.config();
import sequelize from "./database";
import { User, Prize, Activity, ActivityEntry, PointHistory } from "../models";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la base de datos.");

    // Sincronizar tablas (recrear en desarrollo)
    await sequelize.sync({ force: true });
    console.log("Tablas sincronizadas.");

    // Crear usuarios
    const hash = await bcrypt.hash("password123", 10);
    await User.bulkCreate([
      {
        name: "Administrador",
        email: "admin@premios.com",
        password: hash,
        role: "admin",
        points: 0,
      },
      {
        name: "Moderador Ejemplo",
        email: "moderador@premios.com",
        password: hash,
        role: "moderator",
        points: 0,
      },
      // Usuarios con puntos para el ranking
      {
        name: "Sofia Martinez",
        email: "sofia@premios.com",
        password: hash,
        role: "user",
        points: 4800,
        status: "active",
      },
      {
        name: "Carlos Gomez",
        email: "carlos@premios.com",
        password: hash,
        role: "user",
        points: 3950,
        status: "active",
      },
      {
        name: "Ana Rodriguez",
        email: "ana@premios.com",
        password: hash,
        role: "user",
        points: 3200,
        status: "active",
      },
      {
        name: "Luis Perez",
        email: "luis@premios.com",
        password: hash,
        role: "user",
        points: 2750,
        status: "active",
      },
      {
        name: "Maria Lopez",
        email: "maria@premios.com",
        password: hash,
        role: "user",
        points: 2100,
        status: "active",
      },
      {
        name: "Diego Torres",
        email: "diego@premios.com",
        password: hash,
        role: "user",
        points: 1680,
        status: "active",
      },
      {
        name: "Valentina Cruz",
        email: "valentina@premios.com",
        password: hash,
        role: "user",
        points: 1200,
        status: "active",
      },
      {
        name: "Andres Ruiz",
        email: "andres@premios.com",
        password: hash,
        role: "user",
        points: 980,
        status: "active",
      },
      {
        name: "Camila Vargas",
        email: "camila@premios.com",
        password: hash,
        role: "user",
        points: 750,
        status: "active",
      },
      {
        name: "Usuario Demo",
        email: "usuario@premios.com",
        password: hash,
        role: "user",
        points: 500,
        status: "active",
      },
    ]);
    console.log("Usuarios creados.");

    // Crear premios
    await Prize.bulkCreate([
      {
        name: "Auriculares Bluetooth",
        description: "Auriculares inalambricos de alta calidad",
        points_required: 300,
        image:
          "https://smodprint.com/wp-content/uploads/2018/09/Large-Format-Flex-Banner-Print.jpg",
        stock: 10,
      },
      {
        name: "Tarjeta de regalo $50",
        description: "Tarjeta de regalo para tiendas en linea",
        points_required: 200,
        image:
          "https://smodprint.com/wp-content/uploads/2018/09/Large-Format-Flex-Banner-Print.jpg",
        stock: 20,
      },
      {
        name: "Mochila Ejecutiva",
        description: 'Mochila de cuero para laptop de 15"',
        image:
          "https://smodprint.com/wp-content/uploads/2018/09/Large-Format-Flex-Banner-Print.jpg",
        points_required: 500,
        stock: 5,
      },
      {
        name: "Termo Stanley 1L",
        description: "Termo de acero inoxidable 1 litro",
        image:
          "https://smodprint.com/wp-content/uploads/2018/09/Large-Format-Flex-Banner-Print.jpg",
        points_required: 150,
        stock: 15,
      },
      {
        name: "Curso Online Premium",
        description: "Acceso a plataforma de cursos por 1 ano",
        image:
          "https://smodprint.com/wp-content/uploads/2018/09/Large-Format-Flex-Banner-Print.jpg",
        points_required: 400,
        stock: 50,
      },
    ]);
    console.log("Premios creados.");

    // Obtener IDs de usuarios creados
    const [admin, moderador, sofia, carlos, ana, luis] = await User.findAll({
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
      limit: 6,
    });

    // Crear actividades
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await Activity.bulkCreate([
      {
        name: "Capacitacion Mensual",
        description:
          "Asiste a la capacitacion mensual del equipo y gana puntos",
        points_reward: 100,
        start_date: now,
        image:
          "https://smodprint.com/wp-content/uploads/2018/09/Large-Format-Flex-Banner-Print.jpg",
        end_date: future,
        status: "active",
      },
      {
        name: "Encuesta de Satisfaccion",
        description: "Completa la encuesta de satisfaccion del trimestre",
        points_reward: 50,
        start_date: now,
        image:
          "https://smodprint.com/wp-content/uploads/2018/09/Large-Format-Flex-Banner-Print.jpg",
        end_date: future,
        status: "active",
      },
      {
        name: "Referir un Colega",
        description: "Refiere a un nuevo miembro al programa y gana puntos",
        image:
          "https://smodprint.com/wp-content/uploads/2018/09/Large-Format-Flex-Banner-Print.jpg",
        points_reward: 200,
        start_date: now,
        end_date: future,
        status: "active",
      },
    ]);
    console.log("Actividades creadas.");

    // Obtener IDs de actividades creadas
    const [actCapacitacion, actEncuesta, actReferir] = await Activity.findAll({
      attributes: ["id", "name", "points_reward"],
      order: [["id", "ASC"]],
      limit: 3,
    });

    // Crear participaciones de ejemplo
    await ActivityEntry.bulkCreate([
      {
        // Pendiente: Sofia en Capacitacion Mensual
        user_id: sofia.id,
        activity_id: actCapacitacion.id,
        file: "seed-participacion-sofia.pdf",
        status: "pending",
      },
      {
        // Pendiente: Luis en Referir un Colega
        user_id: luis.id,
        activity_id: actReferir.id,
        file: "seed-participacion-luis.pdf",
        status: "pending",
      },
      {
        // Aprobada: Carlos en Encuesta — aprobado por Moderador
        user_id: carlos.id,
        activity_id: actEncuesta.id,
        file: "seed-participacion-carlos.pdf",
        status: "approved",
        reviewed_by: moderador.id,
        review_notes: "Encuesta completada correctamente.",
      },
      {
        // Aprobada: Ana en Capacitacion — aprobado por Admin
        user_id: ana.id,
        activity_id: actCapacitacion.id,
        file: "seed-participacion-ana.pdf",
        status: "approved",
        reviewed_by: admin.id,
        review_notes: "Asistencia confirmada.",
      },
      {
        // Rechazada: Sofia en Referir un Colega — rechazada por Moderador
        user_id: sofia.id,
        activity_id: actReferir.id,
        file: "seed-participacion-sofia-2.pdf",
        status: "rejected",
        reviewed_by: moderador.id,
        review_notes: "No cumple con los requisitos minimos.",
      },
    ]);
    console.log("Participaciones creadas.");

    // PointHistory para las participaciones aprobadas
    await PointHistory.bulkCreate([
      {
        user_id: carlos.id,
        points: actEncuesta.dataValues.points_reward,
        action: "earned",
        description: `Actividad aprobada: ${actEncuesta.dataValues.name}`,
        assigned_by: moderador.id,
      },
      {
        user_id: ana.id,
        points: actCapacitacion.dataValues.points_reward,
        action: "earned",
        description: `Actividad aprobada: ${actCapacitacion.dataValues.name}`,
        assigned_by: admin.id,
      },
    ]);
    console.log("Historial de puntos creado.");

    console.log("\n=== SEEDER COMPLETADO ===");
    console.log("Usuarios de prueba:");
    console.log("  admin@premios.com      / password123 (admin)");
    console.log("  moderador@premios.com  / password123 (moderator)");
    console.log("  usuario@premios.com    / password123 (user - 500 pts)");
    process.exit(0);
  } catch (error) {
    console.error("Error en seeder:", error);
    process.exit(1);
  }
}

seed();
