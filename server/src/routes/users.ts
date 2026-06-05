import { Router, Response } from "express";
import { auth, db } from "../firebase";
import { AuthRequest, requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:uid/role", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    await auth.setCustomUserClaims(req.params.uid, { role });
    await db.collection("users").doc(req.params.uid).update({ role });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:uid", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db.collection("users").doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
