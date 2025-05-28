import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession", required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", ChatMessageSchema);
