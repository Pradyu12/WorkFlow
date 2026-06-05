import { Request, Response, NextFunction } from "express";
import { auth } from "../firebase";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.split("Bearer ")[1];
  try {
    const decoded = await auth.verifyIdToken(token);
    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    req.userRole = (decoded.role as string) || "user";
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  await requireAuth(req, res, () => {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    next();
  });
}
