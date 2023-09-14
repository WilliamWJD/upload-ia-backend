import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { createReadStream } from "node:fs";
import { openai } from "../lib/openai";

export async function generateAiCompletion(app: FastifyInstance) {
  app.post("/ai/complete", async (req, reply) => {
    const bodySchema = z.object({
      id: z.string().uuid(),
      template: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    });

    const { id, template, temperature } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: { id },
    });

    if (!video.transcription) {
      return reply
        .status(400)
        .send({ error: "Video transcription was not generated yet." });
    }

    const promptMessage = template.replace(
      "{transcription}",
      video.transcription
    );

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      temperature,
      messages: [{ role: "user", content: promptMessage }],
    });

    return response;
  });
}
