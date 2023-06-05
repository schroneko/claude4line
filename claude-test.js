import "dotenv/config";
import { AI_PROMPT, Client, HUMAN_PROMPT } from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("The ANTHROPIC_API_KEY environment variable must be set");
}

const client = new Client(apiKey);

client
  .complete({
    prompt: `${HUMAN_PROMPT} こんにちは。${AI_PROMPT}`,
    stop_sequences: [HUMAN_PROMPT],
    max_tokens_to_sample: 200,
    model: "claude-v1",
  })
  .then((finalSample) => {
    console.log(finalSample.completion);
  })
  .catch((error) => {
    console.error(error);
  });
