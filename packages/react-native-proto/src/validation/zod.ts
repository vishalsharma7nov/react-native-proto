import type { MessageCodec } from "../types";

export type ZodLikeSchema<T = unknown> = {
  parse: (data: unknown) => T;
  safeParse?: (
    data: unknown,
  ) => { success: true; data: T } | { success: false; error: unknown };
};

/**
 * Wrap a protobuf codec with optional Zod (or Zod-compatible) request/response
 * validation. Peer dependency: install `zod` in your app.
 */
export function withZodValidation(
  codec: MessageCodec,
  options: {
    request?: ZodLikeSchema<Record<string, unknown>>;
    response?: ZodLikeSchema<Record<string, unknown>>;
  },
): MessageCodec {
  return {
    encode(message) {
      const value = options.request ? options.request.parse(message) : message;
      return codec.encode(value as Record<string, unknown>);
    },
    decode(bytes) {
      const decoded = codec.decode(bytes);
      return options.response
        ? (options.response.parse(decoded) as Record<string, unknown>)
        : decoded;
    },
  };
}

/**
 * Apply Zod schemas to selected type names in a codec registry.
 */
export function wrapCodecRegistryWithZod(
  registry: {
    get(typeName: string): MessageCodec | undefined;
    has(typeName: string): boolean;
  },
  schemas: Record<
    string,
    { request?: ZodLikeSchema; response?: ZodLikeSchema } | ZodLikeSchema
  >,
): {
  get(typeName: string): MessageCodec | undefined;
  has(typeName: string): boolean;
} {
  return {
    has(typeName) {
      return registry.has(typeName);
    },
    get(typeName) {
      const base = registry.get(typeName);
      if (!base) return undefined;
      const entry = schemas[typeName];
      if (!entry) return base;
      if ("parse" in entry && typeof entry.parse === "function") {
        return withZodValidation(base, {
          request: entry as ZodLikeSchema<Record<string, unknown>>,
          response: entry as ZodLikeSchema<Record<string, unknown>>,
        });
      }
      return withZodValidation(
        base,
        entry as {
          request?: ZodLikeSchema<Record<string, unknown>>;
          response?: ZodLikeSchema<Record<string, unknown>>;
        },
      );
    },
  };
}
