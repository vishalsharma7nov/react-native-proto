import { defaultCodecs } from "@vishalsharma7nov/react-native-proto";
import { DEMO_USER_ID, MOCK_USER } from "../config/flags";
import { requestBodyToBytes } from "./requestBody";

/**
 * In-memory protobuf server so the demo button works without a backend.
 */
export function createMockFetch(): typeof fetch {
  const requestCodec = defaultCodecs.get("demo.GetUserRequest");
  const userCodec = defaultCodecs.get("demo.User");
  if (!requestCodec || !userCodec) {
    throw new Error("Missing demo User codecs — run npm run proto:gen");
  }

  return (async (_url: RequestInfo | URL, init?: RequestInit) => {
    const request = requestCodec.decode(
      requestBodyToBytes(init?.body ?? null),
    );
    const responseBytes = userCodec.encode({
      id: String(request.id ?? DEMO_USER_ID),
      name: MOCK_USER.name,
      age: MOCK_USER.age,
    });

    return new Response(
      responseBytes.buffer.slice(
        responseBytes.byteOffset,
        responseBytes.byteOffset + responseBytes.byteLength,
      ) as ArrayBuffer,
      {
        status: 200,
        headers: { "Content-Type": "application/x-protobuf" },
      },
    );
  }) as typeof fetch;
}
