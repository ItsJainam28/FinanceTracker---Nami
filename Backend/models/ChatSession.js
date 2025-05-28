import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Chat" },
  },
  { timestamps: true } // includes createdAt and updatedAt
);

export default mongoose.model("ChatSession", ChatSessionSchema);
