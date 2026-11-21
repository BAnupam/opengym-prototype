import { describe, expect, it } from "vitest";
import { ApiErrorEnvelopeSchema } from "./index";

describe("ApiErrorEnvelopeSchema", () => {
  it("validates a correct error envelope", () => {
    const result = ApiErrorEnvelopeSchema.safeParse({
      error: "VALIDATION_ERROR",
      code: "BAD_REQUEST",
      message: "The field 'name' is required.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an envelope missing the 'code' field", () => {
    const result = ApiErrorEnvelopeSchema.safeParse({
      error: "VALIDATION_ERROR",
      message: "The field 'name' is required.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an envelope with a non-string 'message'", () => {
    const result = ApiErrorEnvelopeSchema.safeParse({
      error: "VALIDATION_ERROR",
      code: "BAD_REQUEST",
      message: 42,
    });

    expect(result.success).toBe(false);
  });
});
