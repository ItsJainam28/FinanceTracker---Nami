import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";


/* Create new chat session */
export const createSession = async (req, res, next) => {
  try {
    const session = await ChatSession.create({
      userId: req.user._id,
      title: "New Chat",
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

/* Fetch all chat sessions for user */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt createdAt");

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

/* Fetch full message history for a session */
export const getSessionMessages = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;

    // Optional: validate ownership
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    const messages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .select("role content createdAt");

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

