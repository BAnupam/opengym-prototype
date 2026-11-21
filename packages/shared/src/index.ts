import { z } from "zod";

/** Standard API error envelope returned by every endpoint. */
export const ApiErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.array(z.string())).optional(),
  }),
});

/** Temporary foundation contract used to exercise API input validation. */
export const FoundationValidationInputSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
});

export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;
