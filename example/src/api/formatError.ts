import { isProtoClientError } from "@vishalsharma7nov/react-native-proto";

export function formatCaughtError(error: unknown): string {
  if (isProtoClientError(error)) {
    const { code, message } = error as { code: string; message: string };
    return `Error ${code}: ${message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
