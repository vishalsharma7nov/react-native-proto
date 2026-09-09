package com.vishalsharma7nov.reactnativeproto;

import android.util.Base64;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * HTTP+protobuf unary bridge for transport "native-grpc".
 * Uses HttpURLConnection (no extra Gradle deps).
 */
public class ReactNativeProtoNativeGrpcModule extends ReactContextBaseJavaModule {
  private static final ExecutorService EXECUTOR = Executors.newCachedThreadPool();

  public ReactNativeProtoNativeGrpcModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ReactNativeProtoNativeGrpc";
  }

  @ReactMethod
  public void isAvailable(Promise promise) {
    promise.resolve(true);
  }

  @ReactMethod
  public void unary(
      String baseUrl,
      String rpcPath,
      String requestBase64,
      String headersJson,
      double timeoutMs,
      Promise promise
  ) {
    EXECUTOR.execute(() -> {
      HttpURLConnection connection = null;
      try {
        if (baseUrl == null || baseUrl.isEmpty()) {
          promise.reject("INVALID_ARGUMENT", "baseUrl is required");
          return;
        }
        if (rpcPath == null || rpcPath.isEmpty()) {
          promise.reject("INVALID_ARGUMENT", "rpcPath is required");
          return;
        }

        byte[] body;
        if (requestBase64 == null || requestBase64.isEmpty()) {
          body = new byte[0];
        } else {
          body = Base64.decode(requestBase64, Base64.DEFAULT);
        }

        String path = rpcPath.startsWith("/") ? rpcPath : "/" + rpcPath;
        String trimmedBase = baseUrl.endsWith("/")
            ? baseUrl.substring(0, baseUrl.length() - 1)
            : baseUrl;
        URL url = new URL(trimmedBase + path);

        connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setUseCaches(false);
        connection.setRequestProperty("Content-Type", "application/x-protobuf");
        connection.setRequestProperty("Accept", "application/x-protobuf");

        int timeout = (int) Math.max(timeoutMs, 1);
        connection.setConnectTimeout(timeout);
        connection.setReadTimeout(timeout);

        if (headersJson != null && headersJson.length() > 0) {
          JSONObject headers = new JSONObject(headersJson);
          Iterator<String> keys = headers.keys();
          while (keys.hasNext()) {
            String key = keys.next();
            if (headers.isNull(key)) {
              continue;
            }
            connection.setRequestProperty(key, headers.get(key).toString());
          }
        }

        connection.setFixedLengthStreamingMode(body.length);
        OutputStream out = connection.getOutputStream();
        out.write(body);
        out.flush();
        out.close();

        int status = connection.getResponseCode();
        InputStream stream = status >= 200 && status < 300
            ? connection.getInputStream()
            : connection.getErrorStream();

        byte[] responseBytes = readFully(stream);
        if (status < 200 || status >= 300) {
          promise.reject("HTTP_ERROR", "HTTP " + status);
          return;
        }

        String responseBase64 = Base64.encodeToString(responseBytes, Base64.NO_WRAP);
        promise.resolve(responseBase64);
      } catch (Exception e) {
        promise.reject("NETWORK", e.getMessage() != null ? e.getMessage() : "Network request failed", e);
      } finally {
        if (connection != null) {
          connection.disconnect();
        }
      }
    });
  }

  private static byte[] readFully(InputStream stream) throws Exception {
    if (stream == null) {
      return new byte[0];
    }
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    byte[] chunk = new byte[4096];
    int n;
    while ((n = stream.read(chunk)) != -1) {
      buffer.write(chunk, 0, n);
    }
    stream.close();
    return buffer.toByteArray();
  }
}
