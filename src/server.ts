import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { getAllPromptsRoutes } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createTranscriptionRoute } from "./routes/create-transcription";
import { generateAiCompletion } from "./routes/generate-ai-completion";

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(getAllPromptsRoutes);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateAiCompletion);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Servidor online");
  });
