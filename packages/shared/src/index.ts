import { z } from "zod";

/** Standard API error envelope returned by every endpoint. */
export const ApiErrorEnvelopeSchema = z.object({
  error: z.string(),
  code: z.string(),
  message: z.string(),
});

export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;
