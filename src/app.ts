import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./shared/middlewares/error.middleware";
import userRoutes from "./modules/user/user.routes";
import studentsRoutes from "./modules/students/students.routes";
import verificationRoutes from "./modules/verification/verification.routes";
import contactRoutes from "./modules/contact/contact.routes";
import { env } from "./config/env";
import { requestLogger } from "./shared/middlewares/request-logger.middleware";

export function createApp() {
  const app = express();
  // Coolify/Apache forwards client IPs via X-Forwarded-* headers in production.
  app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL
        ? env.FRONTEND_URL.split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : false,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use(requestLogger);

  app.get("/", (_req, res) => {
    res.json({ ok: true, message: "Backend is running" });
  });

  app.use("/api", userRoutes);
  app.use("/api", studentsRoutes);
  app.use("/api", verificationRoutes);
  app.use("/api", contactRoutes);
  app.use(errorMiddleware);

  return app;
}
