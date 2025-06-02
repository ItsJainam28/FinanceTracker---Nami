import express from "express";
import {protect,} from "../middleware/authMiddleware.js";
import {
  createSession,
  getSessions,
  getSessionMessages,
  getSession,
  deleteSession,
  updateSessionTitle,

} from "../controllers/aiController.js";

import { streamAssistantReply } from "../controllers/streamingAiController.js"; // 🆕

const router = express.Router();

// Existing routes
router.post("/sessions", protect, createSession);
router.get("/sessions", protect, getSessions);
router.put("/sessions/:id/title", protect, updateSessionTitle);
router.get("/sessions/:id/messages", protect, getSessionMessages);
router.get("/sessions/:id", protect, getSession); 
router.delete("/sessions/:id", protect, deleteSession);

// 🆕 Add the SSE route
router.post("/sessions/:id/stream", protect, streamAssistantReply);

export default router;
