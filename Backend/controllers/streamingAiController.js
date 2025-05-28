import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import { buildFinanceAgent } from "../ai-agent/agent.js";

export const streamAssistantReply = async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || typeof message !== "string") {
      res.write("event: error\ndata: Invalid message\n\n");
      return res.end();
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Save user's message to DB
    await ChatMessage.create({
      sessionId,
      role: "user",
      content: message.trim(),
    });

    // Get full session message history
    const history = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
    const formattedMessages = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Stream setup
    let fullReply = "";
    const handleToken = (token) => {
      console.log("🔹 Token:", token);
      fullReply += token;
      res.write(`data: ${token}\n\n`);
    };

    // Build agent with user-bound tools
    const agent = await buildFinanceAgent({ userId, onTokenStream: handleToken });

    // Start agent with message history
    await agent.invoke({ messages: formattedMessages });

    const cleanedReply = fullReply.trim();
    // Save assistant reply
    if (!cleanedReply) {
      console.warn("⚠️ Assistant reply was empty. Skipping save.");
    } else {
      await ChatMessage.create({
        sessionId,
        role: "assistant",
        content: cleanedReply,
      });
    }
    await ChatSession.findByIdAndUpdate(sessionId, { updatedAt: new Date() });

    res.write("event: end\ndata: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("❌ SSE error:", err);
    res.write("event: error\ndata: Internal server error\n\n");
    res.end();
  }
};
