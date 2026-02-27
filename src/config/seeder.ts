import dotenv from 'dotenv';
dotenv.config();
import sequelize from './database';
import { User, Prize, Activity } from '../models';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos.');

    // Sincronizar tablas (recrear en desarrollo)
    await sequelize.sync({ force: true });
    console.log('Tablas sincronizadas.');

    // Crear usuarios
    const hash = await bcrypt.hash('password123', 10);
    await User.bulkCreate([
      { name: 'Administrador', email: 'admin@premios.com', password: hash, role: 'admin', points: 0 },
      { name: 'Moderador Ejemplo', email: 'moderador@premios.com', password: hash, role: 'moderator', points: 0 },
      { name: 'Usuario Demo', email: 'usuario@premios.com', password: hash, role: 'user', points: 500 },
    ]);
    console.log('Usuarios creados.');

    // Crear premios
    await Prize.bulkCreate([
      { name: 'Auriculares Bluetooth', description: 'Auriculares inalambricos de alta calidad', points_required: 300, stock: 10 },
      { name: 'Tarjeta de regalo $50', description: 'Tarjeta de regalo para tiendas en linea', points_required: 200, stock: 20 },
      { name: 'Mochila Ejecutiva', description: 'Mochila de cuero para laptop de 15"', points_required: 500, stock: 5 },
      { name: 'Termo Stanley 1L', description: 'Termo de acero inoxidable 1 litro', points_required: 150, stock: 15 },
      { name: 'Curso Online Premium', description: 'Acceso a plataforma de cursos por 1 ano', points_required: 400, stock: 50 },
    ]);
    console.log('Premios creados.');

    // Crear actividades
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await Activity.bulkCreate([
      {
        name: 'Capacitacion Mensual',
        description: 'Asiste a la capacitacion mensual del equipo y gana puntos',
        points_reward: 100,
        start_date: now,
        end_date: future,
        status: 'active',
      },
      {
        name: 'Encuesta de Satisfaccion',
        description: 'Completa la encuesta de satisfaccion del trimestre',
        points_reward: 50,
        start_date: now,
        end_date: future,
        status: 'active',
      },
      {
        name: 'Referir un Colega',
        description: 'Refiere a un nuevo miembro al programa y gana puntos',
        points_reward: 200,
        start_date: now,
        end_date: future,
        status: 'active',
      },
    ]);
    console.log('Actividades creadas.');

    console.log('\n=== SEEDER COMPLETADO ===');
    console.log('Usuarios de prueba:');
    console.log('  admin@premios.com      / password123 (admin)');
    console.log('  moderador@premios.com  / password123 (moderator)');
    console.log('  usuario@premios.com    / password123 (user - 500 pts)');
    process.exit(0);
  } catch (error) {
    console.error('Error en seeder:', error);
    process.exit(1);
  }
}

seed();
