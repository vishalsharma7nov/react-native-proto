# Errors

All library failures use `ProtoClientError`.

```ts
import { isProtoClientError } from '@vishalsharma7nov/react-native-proto';

try {
  await api.userService.getUser({ id: '1' });
} catch (e) {
  if (isProtoClientError(e)) {
    console.log(e.code, e.message, e.retryable, e.status);
  }
}
```

## Codes

| Code | Meaning | Often retryable? |
|------|---------|------------------|
| `INVALID_CONFIG` | Bad `baseUrl` / transport / missing fetch | No |
| `INVALID_ARGUMENT` | Encode failed or bad headers | No |
| `TIMEOUT` | Exceeded `timeoutMs` | Yes |
| `NETWORK` | Offline / connection error | Yes |
| `HTTP` | Non-2xx HTTP status | Sometimes (5xx, 429) |
| `RPC` | RPC-layer failure (e.g. native) | Sometimes |
| `DECODE` | Response bytes invalid | No |
| `PAYLOAD_TOO_LARGE` | Response bigger than `maxResponseBytes` | No |
| `ABORTED` | Caller aborted the request | No |
| `UNSUPPORTED` | Feature not available for current transport | No |
| `INTERNAL` | Unexpected failure (see `cause`) | No |

## Tips

- Use `e.retryable` before automatic retries.
- Use `e.cause` for the underlying exception.
- `onError` in config is only for logging — it does not stop the throw.
