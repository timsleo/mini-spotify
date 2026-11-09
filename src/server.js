import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './utils/errorHandler.js';
import database from './config/database.js';
import authRouter from './routes/auth.js';
import playlistsRouter from './routes/playlists.js';
import songsRouter from './routes/songs.js';
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não definido. Copie .env.example para .env e preencha.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database before starting the server
const startServer = async () => {
  try {
    await database.init();
    
    // Routes
    app.use('/api/auth', authRouter);
    app.use('/api/playlists', playlistsRouter);
    app.use('/api/songs', songsRouter);

    // Error Handler
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Database connection established');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err.message);
  process.exit(1);
});

startServer();