import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { logger } from "./logger/logger.js";

async function bootstrap() {
  await connectDatabase();
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", { error: err });
  process.exit(1);
});
