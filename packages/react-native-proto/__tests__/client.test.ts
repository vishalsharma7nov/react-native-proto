import {
  createClient,
  createClientFromMap,
  createCodecRegistry,
  isProtoClientError,
  ProtoClientError,
  methodMap,
} from '../src/index';
import { codecFromType } from '../src/codecs';
import { User, GetUserRequest, defaultCodecs } from '../src/generated/messages';

function makeFetch(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  return handler as unknown as typeof fetch;
}

function asBody(bytes: Uint8Array): BodyInit {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

describe('ProtoClientError', () => {
  it('exposes code and retryable', () => {
    const err = new ProtoClientError({
      code: 'TIMEOUT',
      message: 'slow',
      retryable: true,
    });
    expect(isProtoClientError(err)).toBe(true);
    expect(err.code).toBe('TIMEOUT');
    expect(err.retryable).toBe(true);
  });
});

describe('createClient config validation', () => {
  it('rejects missing baseUrl', () => {
    expect(() => createClient({ baseUrl: '' })).toThrow(ProtoClientError);
  });

  it('rejects relative baseUrl', () => {
    expect(() => createClient({ baseUrl: '/api' })).toThrow(/absolute URL/);
  });
});

describe('encode/decode round trip', () => {
  it('round-trips User', () => {
    const codec = codecFromType(User);
    const bytes = codec.encode({ id: '1', name: 'Ada', age: 36 });
    const decoded = codec.decode(bytes);
    expect(decoded).toMatchObject({ id: '1', name: 'Ada', age: 36 });
  });
});

describe('unaryCall via createClient', () => {
  it('posts encoded request and decodes response', async () => {
    const expected = { id: '1', name: 'Ada', age: 36 };
    const responseBytes = codecFromType(User).encode(expected);

    const fetchImpl = makeFetch(async (_url, init) => {
      expect(init?.method).toBe('POST');
      const body = new Uint8Array(init?.body as ArrayBuffer);
      const decodedReq = codecFromType(GetUserRequest).decode(body);
      expect(decodedReq).toMatchObject({ id: '1' });

      return new Response(asBody(responseBytes), {
        status: 200,
        headers: { 'Content-Type': 'application/x-protobuf' },
      });
    });

    const api = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchImpl,
      getHeaders: () => ({ Authorization: 'Bearer test' }),
    });

    const getUser = api.userService!.getUser!;
    const user = await getUser({ id: '1' });
    expect(user).toMatchObject(expected);
  });

  it('maps HTTP errors', async () => {
    const fetchImpl = makeFetch(async () => new Response('nope', { status: 503 }));
    const api = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchImpl,
    });

    await expect(api.userService!.getUser!({ id: '1' })).rejects.toMatchObject({
      code: 'HTTP',
      status: 503,
      retryable: true,
    });
  });

  it('rejects oversized responses', async () => {
    const big = new Uint8Array(100);
    const fetchImpl = makeFetch(
      async () =>
        new Response(asBody(big), {
          status: 200,
          headers: { 'Content-Length': '100' },
        })
    );
    const api = createClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchImpl,
      maxResponseBytes: 10,
    });

    await expect(api.userService!.getUser!({ id: '1' })).rejects.toMatchObject({
      code: 'PAYLOAD_TOO_LARGE',
    });
  });
});

describe('method map', () => {
  it('includes demo services', () => {
    expect(methodMap.length).toBeGreaterThanOrEqual(3);
    expect(methodMap.some((m) => m.serviceName === 'UserService')).toBe(true);
  });

  it('createClientFromMap builds dynamic methods', async () => {
    const codecs = createCodecRegistry({
      'demo.GetUserRequest': GetUserRequest,
      'demo.User': User,
    });
    const fetchImpl = makeFetch(async () => {
      const bytes = codecFromType(User).encode({ id: '9', name: 'Grace', age: 1 });
      return new Response(asBody(bytes), { status: 200 });
    });

    const api = createClientFromMap(
      { baseUrl: 'https://example.com', fetch: fetchImpl },
      [
        {
          serviceName: 'UserService',
          methodName: 'GetUser',
          packageName: 'demo',
          rpcPath: 'demo.UserService/GetUser',
          requestType: 'demo.GetUserRequest',
          responseType: 'demo.User',
          kind: 'unary',
        },
      ],
      codecs
    );

    const user = await api.userService!.getUser!({ id: '9' });
    expect(user).toMatchObject({ id: '9', name: 'Grace' });
    expect(defaultCodecs.has('demo.User')).toBe(true);
  });
});
