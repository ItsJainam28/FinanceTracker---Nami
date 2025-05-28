import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

export class DebugHandler extends BaseCallbackHandler {
  name = "debug-logger";

  handleLLMStart(llm, prompts, runId, parentRunId, tags, metadata) {
    console.log("🧠 LLM Start:", prompts);
  }

  handleLLMNewToken(token) {
    process.stdout.write(token);
  }

  handleToolStart(tool, input, runId, parentRunId, tags, metadata) {
    console.log("🔧 Tool Start:", tool.name, "with input:", input);
  }

  handleToolEnd(output, runId, parentRunId, tags, metadata) {
    console.log("✅ Tool End with output:", output);
  }

  handleChainEnd(output, runId, parentRunId, tags, metadata) {
    console.log("🔚 Chain End:", output);
  }

  handleError(error, runId, parentRunId, tags, metadata) {
    console.error("❌ Agent Error:", error);
  }
}
