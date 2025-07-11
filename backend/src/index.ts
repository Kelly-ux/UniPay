import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './config/database';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// API Routes
app.use('/api/auth', authRoutes);

// Simple test route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the UniPay Backend API!');
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[database]: Connection has been established successfully.');
    
    // In development, you might want to sync models. 
    // Use with caution in production - { force: true } will drop tables.
    await sequelize.sync(); 
    console.log('[database]: Models synchronized successfully.');

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('[server]: Unable to connect to the database or start server:', error);
  }
};

startServer();

export default app;
