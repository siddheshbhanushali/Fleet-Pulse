import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const startServer = async () => {
  try {
    // Attempt to connect to the database before starting the server
    await prisma.$connect();
    console.log('✅ Successfully connected to the database.');

    const PORT = env.PORT || 8000;

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
