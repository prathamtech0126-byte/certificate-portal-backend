import { Router } from "express";
import { apiRateLimiter, authRateLimiter } from "../../shared/middlewares/security.middleware";
import { changePassword, login, logout, refreshAccessToken, registerUser } from "./user.controller";

const router = Router();

router.post("/users/register", authRateLimiter, registerUser);
router.post("/users/login", authRateLimiter, login);
router.post("/users/change-password", authRateLimiter, changePassword);
router.post("/users/refresh-token", apiRateLimiter, refreshAccessToken);
router.post("/users/logout", apiRateLimiter, logout);

export default router;
