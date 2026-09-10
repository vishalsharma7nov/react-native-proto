import {
  createAuthInterceptor,
  createLoggingInterceptor,
  createPathForMethod,
  pathFromTemplate,
  compareDottedVersions,
  encodeConnectEnvelope,
  decodeConnectEnvelopes,
  OfflineMutationQueue,
  createClient,
  ProtoClientError,
  GetUserRequest,
  defaultCodecs,
  methodMap,
} from '../src/index';
import { User } from '../src/generated/messages';
import { CONNECT_FLAG_END_STREAM } from '../src/connect/envelope';
import { tryParseConnectError } from '../src/connect/errors';
import { createMockServer } from '../src/mock-server';
import { codecFromType } from '../src/codecs';

function makeFetch(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  return handler as unknown as typeof fetch;
}

function asBody(bytes: Uint8Array): BodyInit {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

describe('path templates', () => {
  const entry = {
    serviceName: 'UserService',
    methodName: 'GetUser',
    packageName: 'demo',
    rpcPath: 'demo.UserService/GetUser',
    requestType: 'demo.GetUserRequest',
    responseType: 'demo.User',
    kind: 'unary' as const,
  };

  it('builds connect paths', () => {
    expect(createPathForMethod('connect')(entry)).toBe(
      '/demo.UserService/GetUser'
    );
  });

  it('builds restish paths', () => {
    expect(createPathForMethod('restish')(entry)).toBe(
      '/v1/userService/getUser'
    );
  });

  it('supports custom templates', () => {
    expect(pathFromTemplate('/api/{package}/{serviceCamel}/{methodCamel}')(entry)).toBe(
      '/api/demo/userService/getUser'
    );
  });
});

describe('connect envelopes', () => {
  it('round-trips frames', () => {
    const payload = new Uint8Array([1, 2, 3]);
    const frame = encodeConnectEnvelope(payload, 0);
    const decoded = decodeConnectEnvelopes(frame);
    expect(decoded).toHaveLength(1);
    expect(Array.from(decoded[0]!.data)).toEqual([1, 2, 3]);
  });

  it('parses connect JSON errors', () => {
    const err = tryParseConnectError(
      JSON.stringify({ code: 'unauthenticated', message: 'nope' }),
      'demo.UserService/GetUser',
      401
    );
    expect(err).toBeInstanceOf(ProtoClientError);
    expect(err?.message).toMatch(/unauthenticated/);
  });
});

describe('interceptors + auth', () => {
  it('injects bearer token and retries once after refresh', async () => {
    let calls = 0;
    let token = 'old';
    const responseBytes = codecFromType(User).encode({
      id: '1',
      name: 'Ada',
      age: 36,
    });

    const fetchImpl = makeFetch(async (_url, init) => {
      calls += 1;
      const headers = init?.headers as Record<string, string>;
      if (headers.Authorization === 'Bearer old') {
        return new Response('{"code":"unauthenticated","message":"expired"}', {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      expect(headers.Authorization).toBe('Bearer new');
      return new Response(asBody(responseBytes), { status: 200 });
    });

    const api = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchImpl,
      transport: 'connect',
      interceptors: [
        createAuthInterceptor({
          getAccessToken: () => token,
          refreshAccessToken: async () => {
            token = 'new';
            return token;
          },
          isUnauthorized: (error) =>
            error instanceof ProtoClientError && error.status === 401,
        }),
        createLoggingInterceptor({ log: () => undefined }),
      ],
    });

    const user = await api.userService!.getUser!({ id: '1' });
    expect(user).toMatchObject({ id: '1', name: 'Ada' });
    expect(calls).toBe(2);
  });
});

describe('offline queue', () => {
  it('queues while offline and flushes', async () => {
    const queue = new OfflineMutationQueue({ maxSize: 10 });
    queue.setOnline(false);
    const order: string[] = [];

    const p = queue.runOrEnqueue('add', async () => {
      order.push('ran');
      return 42;
    });

    expect(queue.size()).toBe(1);
    queue.setOnline(true);
    await expect(p).resolves.toBe(42);
    expect(order).toEqual(['ran']);
  });
});

describe('version compare', () => {
  it('compares dotted versions', () => {
    expect(compareDottedVersions('1.2.0', '1.10.0')).toBeLessThan(0);
    expect(compareDottedVersions('2.0.0', '1.9.9')).toBeGreaterThan(0);
  });
});

describe('mock server', () => {
  it('serves unary protobuf', async () => {
    const mock = createMockServer({
      methodMap,
      codecs: defaultCodecs,
      handlers: {
        'demo.UserService/GetUser': async (req) => ({
          id: String(req.id ?? ''),
          name: 'Mock',
          age: 1,
        }),
      },
    });
    const { baseUrl } = await mock.listen();
    try {
      const api = createClient({ baseUrl });
      const user = await api.userService!.getUser!({ id: '9' });
      expect(user).toMatchObject({ id: '9', name: 'Mock' });
    } finally {
      await mock.close();
    }
  });
});

describe('connect server streaming envelopes', () => {
  it('decodes multiple envelopes from buffered body', async () => {
    const u1 = codecFromType(User).encode({ id: '1', name: 'A', age: 1 });
    const u2 = codecFromType(User).encode({ id: '2', name: 'B', age: 2 });
    const body = new Uint8Array([
      ...encodeConnectEnvelope(u1),
      ...encodeConnectEnvelope(u2),
      ...encodeConnectEnvelope(new Uint8Array(0), CONNECT_FLAG_END_STREAM),
    ]);

    const fetchImpl = makeFetch(async () => {
      return new Response(asBody(body), {
        status: 200,
        headers: { 'Content-Type': 'application/connect+proto' },
      });
    });

    const { streamCall } = await import('../src/streaming');
    const { resolveConfig } = await import('../src/transport');
    const config = resolveConfig({
      baseUrl: 'https://api.example.com',
      fetch: fetchImpl,
      transport: 'connect',
    });

    const messages: Record<string, unknown>[] = [];
    for await (const msg of streamCall(config, defaultCodecs, {
      entry: {
        serviceName: 'UserService',
        methodName: 'ListUsersStream',
        packageName: 'demo',
        rpcPath: 'demo.UserService/ListUsersStream',
        requestType: 'demo.GetUserRequest',
        responseType: 'demo.User',
        kind: 'serverStreaming',
      },
      request: {},
    })) {
      messages.push(msg);
    }

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ id: '1' });
    expect(messages[1]).toMatchObject({ id: '2' });
    expect(GetUserRequest({ id: '1' })).toEqual({ id: '1' });
  });
});
