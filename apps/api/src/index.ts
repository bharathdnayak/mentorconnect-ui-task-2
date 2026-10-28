import { createApp } from './app';
import { config } from './config/env';
import { connectDB } from './config/db';

async function bootstrap() {
  await connectDB();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`MentorConnect API Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`API Base URL: http://localhost:${config.port}/api/v1`);
    console.log(`Health Check: http://localhost:${config.port}/api/v1/health`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Error]:', err);
  process.exit(1);
});
