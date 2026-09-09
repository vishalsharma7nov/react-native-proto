import type { Type } from 'protobufjs';
import type { CodecRegistry, MessageCodec, ProtobufTypeLike } from './types';

export function codecFromType(type: ProtobufTypeLike): MessageCodec {
  return {
    encode(message: Record<string, unknown>) {
      const value = type.fromObject
        ? type.fromObject(message)
        : type.create(message);
      return type.encode(value).finish();
    },
    decode(bytes: Uint8Array) {
      return type.decode(bytes) as unknown as Record<string, unknown>;
    },
  };
}

export function createCodecRegistry(
  types: Record<string, ProtobufTypeLike | Type>
): CodecRegistry {
  const map = new Map<string, MessageCodec>();
  const keys = Object.keys(types);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (!key) {
      continue;
    }
    const type = types[key];
    if (type) {
      map.set(key, codecFromType(type));
    }
  }

  return {
    get(typeName: string) {
      return map.get(typeName);
    },
    has(typeName: string) {
      return map.has(typeName);
    },
  };
}
