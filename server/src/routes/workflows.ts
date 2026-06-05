import { Router, Response } from "express";
import { db } from "../firebase";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection("workflows").get();
    const workflows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(workflows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, steps } = req.body;

    const workflow = {
      name,
      description: description || "",
      steps: steps || [],
      createdBy: req.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("workflows").add(workflow);
    res.status(201).json({ id: docRef.id, ...workflow });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db.collection("workflows").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Workflow not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/instances", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workflowDoc = await db.collection("workflows").doc(req.params.id).get();
    if (!workflowDoc.exists) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    const workflow = workflowDoc.data()!;
    const { title, data } = req.body;

    const instance = {
      workflowId: req.params.id,
      workflowName: workflow.name,
      title: title || workflow.name,
      status: "pending",
      currentStep: 0,
      initiatedBy: req.userId,
      data: data || {},
      steps: workflow.steps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("workflowInstances").add(instance);

    if (workflow.steps.length > 0) {
      const firstStep = workflow.steps[0];
      await db.collection("approvals").add({
        workflowInstanceId: docRef.id,
        stepOrder: 0,
        stepName: firstStep.name,
        assignedTo: firstStep.assignedTo || null,
        assignedRole: firstStep.assignedRole || null,
        status: "pending",
        comments: "",
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({ id: docRef.id, ...instance });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/instances", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection("workflowInstances").get();
    const instances = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(instances);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/instances/:id/approve", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { comments } = req.body;
    const instanceId = req.params.id;
    const instanceDoc = await db.collection("workflowInstances").doc(instanceId).get();
    if (!instanceDoc.exists) return res.status(404).json({ error: "Instance not found" });

    const instance = instanceDoc.data()!;
    const currentStep = instance.currentStep;
    const steps = instance.steps || [];

    const approvalQuery = await db.collection("approvals")
      .where("workflowInstanceId", "==", instanceId)
      .where("stepOrder", "==", currentStep)
      .get();

    const approvalDoc = approvalQuery.docs[0];
    if (approvalDoc) {
      await approvalDoc.ref.update({
        status: "approved",
        comments: comments || "",
        approvedBy: req.userId,
        approvedAt: new Date().toISOString(),
      });
    }

    const nextStep = currentStep + 1;
    if (nextStep >= steps.length) {
      await db.collection("workflowInstances").doc(instanceId).update({
        status: "approved",
        currentStep: nextStep,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.collection("workflowInstances").doc(instanceId).update({
        status: "in_progress",
        currentStep: nextStep,
        updatedAt: new Date().toISOString(),
      });

      await db.collection("approvals").add({
        workflowInstanceId: instanceId,
        stepOrder: nextStep,
        stepName: steps[nextStep].name,
        assignedTo: steps[nextStep].assignedTo || null,
        assignedRole: steps[nextStep].assignedRole || null,
        status: "pending",
        comments: "",
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/instances/:id/reject", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { comments } = req.body;
    const instanceId = req.params.id;

    await db.collection("workflowInstances").doc(instanceId).update({
      status: "rejected",
      updatedAt: new Date().toISOString(),
    });

    const approvalQuery = await db.collection("approvals")
      .where("workflowInstanceId", "==", instanceId)
      .where("status", "==", "pending")
      .get();

    for (const doc of approvalQuery.docs) {
      await doc.ref.update({
        status: "rejected",
        comments: comments || "",
        rejectedBy: req.userId,
        rejectedAt: new Date().toISOString(),
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
