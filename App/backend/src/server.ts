import app from './app';
import { config } from './config';
import prisma from './prisma';

const startServer = async () => {
  try {
    // Check database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    const port = config.port;
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port} in ${config.nodeEnv} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        prisma.$disconnect();
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        prisma.$disconnect();
      });
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
