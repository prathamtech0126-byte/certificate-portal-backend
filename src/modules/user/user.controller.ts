import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/utils/errors/AppError";
import { changePasswordSchema, loginSchema, registerUserSchema } from "./user.validation";
import { userService } from "./user.service";

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict",
    path: "/",
  };
}

export async function registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = registerUserSchema.parse(req.body);
    const user = await userService.register(payload);
    res.status(201).json({ ok: true, user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = loginSchema.parse(req.body);
    const { user, tokens } = await userService.login(payload);

    const cookieOptions = getCookieOptions();

    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      ok: true,
      message: "Login successful",
      user,
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined);

    if (!refreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    const accessToken = await userService.refreshAccessToken(refreshToken);
    const cookieOptions = getCookieOptions();

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      ok: true,
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    await userService.logout(refreshToken);

    const cookieOptions = getCookieOptions();
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({ ok: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = changePasswordSchema.parse(req.body);
    await userService.changePassword(payload);
    res.status(200).json({ ok: true, message: "Password changed successfully. Please login again." });
  } catch (err) {
    next(err);
  }
}
