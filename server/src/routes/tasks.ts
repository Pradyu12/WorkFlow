import { Router, Response } from "express";
import { db, auth } from "../firebase";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignedTo } = req.query;
    let query: FirebaseFirestore.Query = db.collection("tasks");

    if (status) query = query.where("status", "==", status);
    if (assignedTo) query = query.where("assignedTo", "==", assignedTo);

    const snapshot = await query.get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const task = {
      title,
      description: description || "",
      status: "todo",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      createdBy: req.userId,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("tasks").add(task);
    res.status(201).json({ id: docRef.id, ...task });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection("tasks").doc(req.params.id).update(updates);
    const doc = await db.collection("tasks").doc(req.params.id).get();
    res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await db.collection("tasks").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
