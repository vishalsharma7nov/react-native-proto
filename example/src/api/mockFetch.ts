import {
  codecFromType,
  GetUserRequest,
  User,
} from "@vishalsharma7nov/react-native-proto";
import { DEMO_USER_ID, MOCK_USER } from "../config/flags";
import { requestBodyToBytes } from "./requestBody";

/**
 * In-memory protobuf server so the demo button works without a backend.
 */
export function createMockFetch(): typeof fetch {
  return (async (_url: RequestInfo | URL, init?: RequestInit) => {
    const request = codecFromType(GetUserRequest).decode(
      requestBodyToBytes(init?.body ?? null),
    );
    const responseBytes = codecFromType(User).encode({
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
