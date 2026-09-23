/**
 * Schema for the leaf-mapping call (see code.ts's requestLeafDecisions): a FLAT array of
 * per-element decisions, keyed by an id the caller already assigned from deterministic HTML
 * parsing — never a nested tree, so there's no structure for the model to reproduce, drop, or
 * get wrong, and (being flat) no depth to unroll, so the full componentId enum can safely
 * appear here even for Gemini without multiplying across nesting levels the way it would for a
 * recursive tree schema.
 */
export function buildLeafDecisionsJsonSchema(
  componentIds: string[],
  textStyleNames: string[]
): Record<string, unknown> {
  return {
    type: "object",
    required: ["decisions"],
    properties: {
      decisions: {
        type: "array",
        items: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
            ...(componentIds.length ? { componentId: { type: "string", enum: componentIds } } : {}),
            text: {
              type: "object",
              required: ["characters"],
              properties: {
                characters: { type: "string" },
                style: { type: "string", enum: textStyleNames }
              }
            },
            properties: {
              type: "object",
              additionalProperties: { type: ["string", "boolean"] }
            }
          }
        }
      }
    }
  };
}

/** Gemini-dialect equivalent of buildLeafDecisionsJsonSchema. */
export function buildGeminiLeafDecisionsSchema(
  componentIds: string[],
  textStyleNames: string[]
): Record<string, unknown> {
  return {
    type: "OBJECT",
    required: ["decisions"],
    properties: {
      decisions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          required: ["id"],
          properties: {
            id: { type: "STRING" },
            ...(componentIds.length ? { componentId: { type: "STRING", enum: componentIds } } : {}),
            text: {
              type: "OBJECT",
              required: ["characters"],
              properties: {
                characters: { type: "STRING" },
                style: { type: "STRING", enum: textStyleNames }
              }
            },
            properties: { type: "OBJECT" }
          }
        }
      }
    }
  };
}
