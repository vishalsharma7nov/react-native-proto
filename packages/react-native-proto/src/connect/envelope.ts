/**
 * Connect protocol envelope framing (unary streaming / server streaming).
 * Spec: 1 flag byte + 4-byte big-endian length + payload.
 *
 * Flag bits:
 * - 0x01 compressed
 * - 0x02 end-stream (JSON trailer / error)
 */

export const CONNECT_FLAG_COMPRESSED = 0x01;
export const CONNECT_FLAG_END_STREAM = 0x02;

export type ConnectEnvelope = {
  flags: number;
  data: Uint8Array;
};

export function encodeConnectEnvelope(
  data: Uint8Array,
  flags = 0
): Uint8Array {
  const out = new Uint8Array(5 + data.byteLength);
  out[0] = flags & 0xff;
  const len = data.byteLength;
  out[1] = (len >>> 24) & 0xff;
  out[2] = (len >>> 16) & 0xff;
  out[3] = (len >>> 8) & 0xff;
  out[4] = len & 0xff;
  out.set(data, 5);
  return out;
}

export function decodeConnectEnvelopes(buffer: Uint8Array): ConnectEnvelope[] {
  const envelopes: ConnectEnvelope[] = [];
  let offset = 0;
  while (offset + 5 <= buffer.byteLength) {
    const flags = buffer[offset]!;
    const len =
      ((buffer[offset + 1]! << 24) |
        (buffer[offset + 2]! << 16) |
        (buffer[offset + 3]! << 8) |
        buffer[offset + 4]!) >>>
      0;
    offset += 5;
    if (offset + len > buffer.byteLength) {
      break;
    }
    envelopes.push({
      flags,
      data: buffer.subarray(offset, offset + len),
    });
    offset += len;
  }
  return envelopes;
}

export async function* readConnectEnvelopeStream(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number
): AsyncGenerator<ConnectEnvelope, void, undefined> {
  if (!body) {
    return;
  }

  const reader = body.getReader();
  let pending = new Uint8Array(0);
  let total = 0;

  const append = (chunk: Uint8Array) => {
    total += chunk.byteLength;
    if (total > maxBytes) {
      throw new Error(`Connect stream exceeded maxResponseBytes (${maxBytes})`);
    }
    const next = new Uint8Array(pending.byteLength + chunk.byteLength);
    next.set(pending, 0);
    next.set(chunk, pending.byteLength);
    pending = next;
  };

  try {
    while (true) {
      while (pending.byteLength >= 5) {
        const len =
          ((pending[1]! << 24) |
            (pending[2]! << 16) |
            (pending[3]! << 8) |
            pending[4]!) >>>
          0;
        if (pending.byteLength < 5 + len) {
          break;
        }
        const flags = pending[0]!;
        const data = pending.subarray(5, 5 + len);
        pending = pending.subarray(5 + len);
        yield { flags, data };
        if (flags & CONNECT_FLAG_END_STREAM) {
          return;
        }
      }

      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        append(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
