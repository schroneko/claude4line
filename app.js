'use strict';

import "dotenv/config";
import { AI_PROMPT, Client, HUMAN_PROMPT } from "@anthropic-ai/sdk";
import express from 'express';
import line from '@line/bot-sdk';

const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
};

const anthropicApiKey = process.env.ANTHROPIC_API_KEY 
  || (() => {
    throw new Error("The ANTHROPIC_API_KEY environment variable must be set");
  })();

const app = express();

app.post('/webhook', line.middleware(config), async (req, res) => {
    console.log(req.body.events[0].message.text);

    const lineMessage = req.body.events[0].message.text;

    const lineClient = new line.Client(config);

    async function handleEvent(event) {
        if (event.type !== 'message' || event.message.type !== 'text') {
            return Promise.resolve(null);
        }

        const claudeClient = new Client(anthropicApiKey);

        try {
            const finalSample = await claudeClient.complete({
                prompt: `${HUMAN_PROMPT} ${lineMessage} ${AI_PROMPT}`,
                stop_sequences: [HUMAN_PROMPT],
                max_tokens_to_sample: 4096,
                model: "claude-v1",
            });
            console.log("finalSample.completion: " + finalSample.completion);
            return lineClient.replyMessage(event.replyToken, 
                {
                  type: 'text',
                  text:  finalSample.completion
                }
            );
        } catch (error) {
            console.error(error);
        }
    }

    Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

app.listen(PORT);
console.log(`Server running at ${PORT}`);
