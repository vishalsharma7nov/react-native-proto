import http from "http";
import { ProtoClientError } from "../errors";
import type { CodecRegistry, MethodMap, MethodMapEntry } from "../types";

export type MockHandler = (
  request: Record<string, unknown>,
  entry: MethodMapEntry,
) =>
  | Record<string, unknown>
  | Promise<Record<string, unknown>>
  | AsyncIterable<Record<string, unknown>>;

export type MockServerOptions = {
  methodMap: MethodMap;
  codecs: CodecRegistry;
  /** Map rpcPath or MethodName → handler. Fallback: echo empty response encode attempt. */
  handlers?: Record<string, MockHandler>;
  host?: string;
  port?: number;
  /** Default transport content-type behavior */
  contentType?: "application/x-protobuf" | "application/proto";
};

function matchEntry(
  methodMap: MethodMap,
  urlPath: string,
): MethodMapEntry | undefined {
  const normalized = urlPath.replace(/^\//, "");
  for (let i = 0; i < methodMap.length; i += 1) {
    const entry = methodMap[i];
    if (!entry) continue;
    const connectPath = `${entry.packageName ? `${entry.packageName}.` : ""}${entry.serviceName}/${entry.methodName}`;
    if (
      normalized === connectPath ||
      normalized === entry.rpcPath ||
      urlPath.endsWith(`/${entry.methodName}`)
    ) {
      return entry;
    }
  }
  return undefined;
}

async function readRequestBody(req: http.IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Tiny local protobuf HTTP mock driven by the same method map + codecs as the client.
 * Useful for demos and integration tests.
 */
export function createMockServer(options: MockServerOptions): {
  listen: () => Promise<{ host: string; port: number; baseUrl: string }>;
  close: () => Promise<void>;
  server: http.Server;
} {
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 0;
  const contentType = options.contentType ?? "application/x-protobuf";
  const handlers = options.handlers ?? {};

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method !== "POST" || !req.url) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const url = new URL(req.url, `http://${host}`);
      const entry = matchEntry(options.methodMap, url.pathname);
      if (!entry) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end(`Unknown RPC path: ${url.pathname}`);
        return;
      }

      const requestCodec = options.codecs.get(entry.requestType);
      const responseCodec = options.codecs.get(entry.responseType);
      if (!requestCodec || !responseCodec) {
        res.writeHead(500);
        res.end("Missing codecs");
        return;
      }

      const raw = await readRequestBody(req);
      const decoded = requestCodec.decode(new Uint8Array(raw));

      const handler =
        handlers[entry.rpcPath] ||
        handlers[entry.methodName] ||
        handlers[`${entry.serviceName}/${entry.methodName}`];

      let result: Record<string, unknown>;
      if (handler) {
        const maybe = await handler(decoded, entry);
        const asyncIter = maybe as AsyncIterable<Record<string, unknown>>;
        if (
          maybe &&
          typeof maybe === "object" &&
          typeof asyncIter[Symbol.asyncIterator] === "function"
        ) {
          let first: Record<string, unknown> | undefined;
          for await (const msg of asyncIter) {
            first = msg;
            break;
          }
          result = first ?? {};
        } else {
          result = (maybe as Record<string, unknown>) ?? {};
        }
      } else {
        result = {};
      }

      const bytes = responseCodec.encode(result);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
      });
      res.end(Buffer.from(bytes));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Mock server error";
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(message);
    }
  });

  return {
    server,
    listen() {
      return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, () => {
          const address = server.address();
          if (!address || typeof address === "string") {
            reject(
              new ProtoClientError({
                code: "INTERNAL",
                message: "Failed to bind mock server",
              }),
            );
            return;
          }
          resolve({
            host: address.address,
            port: address.port,
            baseUrl: `http://${address.address}:${address.port}`,
          });
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}
