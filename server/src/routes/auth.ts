import { Router, Request, Response } from "express";
import { auth, db } from "../firebase";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, role } = req.body;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    if (role) {
      await auth.setCustomUserClaims(userRecord.uid, { role });
    }

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: displayName || email.split("@")[0],
      role: role || "user",
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ uid: userRecord.uid, email });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = await auth.verifyIdToken(header.split("Bearer ")[1]);
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    res.json({ uid: decoded.uid, ...userDoc.data() });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
