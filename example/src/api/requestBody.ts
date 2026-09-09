export function requestBodyToBytes(body: BodyInit | null | undefined): Uint8Array {
  if (body instanceof ArrayBuffer) {
    return new Uint8Array(body);
  }

  if (ArrayBuffer.isView(body)) {
    return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  }

  if (typeof body === "string") {
    return new TextEncoder().encode(body);
  }

  return new Uint8Array(0);
}
