import { streamCall } from '../src/streaming';
import { resolveConfig } from '../src/transport';
import { createCodecRegistry } from '../src/codecs';
import { User, GetUserRequest } from '../src/generated/messages';

describe('streaming', () => {
  it('rejects streaming on http transport', async () => {
    const config = resolveConfig({
      baseUrl: 'https://api.example.com',
      transport: 'http',
      fetch: (async () => new Response()) as unknown as typeof fetch,
    });
    const codecs = createCodecRegistry({
      'demo.GetUserRequest': GetUserRequest,
      'demo.User': User,
    });

    const gen = streamCall(config, codecs, {
      entry: {
        serviceName: 'UserService',
        methodName: 'WatchUser',
        packageName: 'demo',
        rpcPath: 'demo.UserService/WatchUser',
        requestType: 'demo.GetUserRequest',
        responseType: 'demo.User',
        kind: 'serverStreaming',
      },
      request: { id: '1' },
    });

    await expect(gen.next()).rejects.toMatchObject({
      code: 'UNSUPPORTED',
    });
  });
});
