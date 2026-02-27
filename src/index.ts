import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import sequelize from './config/database';
import './models'; // cargar asociaciones

// Rutas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import prizeRoutes from './routes/prizes';
import redemptionRoutes from './routes/redemptions';
import activityRoutes from './routes/activities';
import pointRoutes from './routes/points';
import notificationRoutes from './routes/notifications';
import reportRoutes from './routes/reports';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imagenes subidas
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prizes', prizeRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Iniciar servidor
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a MySQL establecida.');
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Error al iniciar:', error);
    process.exit(1);
  }
}

start();
