import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { createReadStream } from "node:fs";
import { openai } from "../lib/openai";

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post("/videos/:id/transcription", async (req) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      prompt: z.string(),
    });

    const { prompt } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id,
      },
    });

    const videoPath = video.path;
    const audioReadStream = createReadStream(videoPath);

    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: "pt",
      response_format: "json",
      temperature: 0,
      prompt,
    });

    await prisma.video.update({
      where: {
        id,
      },
      data: {
        transcription: response.text,
      },
    });

    return response.text;
  });
}
