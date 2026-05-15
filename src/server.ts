import "dotenv/config";
import { env } from "./config/env";
import { createApp } from "./app";
import { checkDatabaseConnection, hasDatabase } from "./shared/db/postgres";
import { scheduleDailyRefreshTokenCleanup } from "./shared/jobs/refresh-token-cleanup.job";

const app = createApp();

async function bootstrap(): Promise<void> {
  if (hasDatabase()) {
    try {
      await checkDatabaseConnection();
      console.log("Database connected");
      scheduleDailyRefreshTokenCleanup();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Database connection failed: ${message}`);
    }
  } else {
    console.warn("DATABASE_URL not found, skipping database connection check");
  }

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Startup failed: ${message}`);
  process.exit(1);
});
