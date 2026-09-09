import {
  createClient,
  createLoggingInterceptor,
  createPathForMethod,
  isProtoClientError,
} from '@vishalsharma7nov/react-native-proto';
import { codecFromType, User } from '@vishalsharma7nov/react-native-proto';

const app = document.querySelector('#app')!;

app.innerHTML = `
  <main style="font-family: ui-sans-serif, system-ui; max-width: 40rem; margin: 2rem auto; padding: 0 1rem;">
    <h1>react-native-proto</h1>
    <p>Web (Vite) unary demo with a local mock fetch.</p>
    <button id="run" type="button">Call getUser</button>
    <pre id="out" style="background:#111;color:#eee;padding:1rem;border-radius:8px;margin-top:1rem;white-space:pre-wrap;"></pre>
  </main>
`;

const out = document.querySelector('#out') as HTMLPreElement;

function asBody(bytes: Uint8Array): BodyInit {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

const mockFetch: typeof fetch = async () => {
  const bytes = codecFromType(User).encode({
    id: 'web-1',
    name: 'Web User',
    email: 'web@example.com',
    age: 21,
  });
  return new Response(asBody(bytes), {
    status: 200,
    headers: { 'Content-Type': 'application/x-protobuf' },
  });
};

const api = createClient({
  baseUrl: 'https://api.example.com',
  fetch: mockFetch,
  pathForMethod: createPathForMethod('connect'),
  interceptors: [
    createLoggingInterceptor({
      log: (message, meta) => {
        console.debug(message, meta);
      },
    }),
  ],
});

document.querySelector('#run')!.addEventListener('click', async () => {
  out.textContent = 'Loading…';
  try {
    const user = await api.userService!.getUser!({ id: 'web-1' });
    out.textContent = JSON.stringify(user, null, 2);
  } catch (error) {
    out.textContent = isProtoClientError(error)
      ? `${error.code}: ${error.message}`
      : String(error);
  }
});
