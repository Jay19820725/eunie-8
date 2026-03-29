import { Router } from "express";
import userRoutes from "./userRoutes.ts";
import subscriptionRoutes from "./subscriptionRoutes.ts";
import reportRoutes from "./reportRoutes.ts";
import journalRoutes from "./journalRoutes.ts";
import sessionRoutes from "./sessionRoutes.ts";
import cardRoutes from "./cardRoutes.ts";
import manifestationRoutes from "./manifestationRoutes.ts";
import bottleRoutes from "./bottleRoutes.ts";
import analyticsRoutes from "./analyticsRoutes.ts";
import settingsRoutes from "./settingsRoutes.ts";
import adminRoutes from "./adminRoutes.ts";
import musicRoutes from "./musicRoutes.ts";
import promptRoutes from "./promptRoutes.ts";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/users", userRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/payments", subscriptionRoutes); // For /api/payments/simulate
router.use("/reports", reportRoutes);
router.use("/journal", journalRoutes);
router.use("/sessions", sessionRoutes);
router.use("/cards", cardRoutes);
router.use("/manifestations", manifestationRoutes);
router.use("/bottles", bottleRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/settings", settingsRoutes);
router.use("/admin", adminRoutes);
router.use("/music", musicRoutes);
router.use("/prompts", promptRoutes);

// Backward compatibility for /api/report/:id
router.get("/report/:id", (req, res, next) => {
  req.url = `/single/${req.params.id}`;
  reportRoutes(req, res, next);
});

export default router;
