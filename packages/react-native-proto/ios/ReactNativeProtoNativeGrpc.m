#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else
#import <React-Core/React/RCTBridgeModule.h>
#endif

/**
 * HTTP+protobuf unary bridge for transport "native-grpc".
 * POSTs application/x-protobuf bodies via NSURLSession.
 */
@interface ReactNativeProtoNativeGrpc : NSObject <RCTBridgeModule>
@end

@implementation ReactNativeProtoNativeGrpc

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(isAvailable,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(@YES);
}

RCT_EXPORT_METHOD(unary:(NSString *)baseUrl
                  rpcPath:(NSString *)rpcPath
                  requestBase64:(NSString *)requestBase64
                  headersJson:(NSString *)headersJson
                  timeoutMs:(nonnull NSNumber *)timeoutMs
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (baseUrl.length == 0) {
    reject(@"INVALID_ARGUMENT", @"baseUrl is required", nil);
    return;
  }
  if (rpcPath.length == 0) {
    reject(@"INVALID_ARGUMENT", @"rpcPath is required", nil);
    return;
  }

  NSData *body = [[NSData alloc] initWithBase64EncodedString:(requestBase64 ?: @"")
                                                     options:NSDataBase64DecodingIgnoreUnknownCharacters];
  if (body == nil && requestBase64.length > 0) {
    reject(@"INVALID_ARGUMENT", @"requestBase64 is not valid base64", nil);
    return;
  }
  if (body == nil) {
    body = [NSData data];
  }

  NSString *path = rpcPath;
  if (![path hasPrefix:@"/"]) {
    path = [NSString stringWithFormat:@"/%@", path];
  }

  NSString *trimmedBase = [baseUrl hasSuffix:@"/"]
    ? [baseUrl substringToIndex:baseUrl.length - 1]
    : baseUrl;
  NSString *urlString = [NSString stringWithFormat:@"%@%@", trimmedBase, path];
  NSURL *url = [NSURL URLWithString:urlString];
  if (url == nil) {
    reject(@"INVALID_ARGUMENT", @"Could not build request URL", nil);
    return;
  }

  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
  request.HTTPMethod = @"POST";
  request.HTTPBody = body;
  [request setValue:@"application/x-protobuf" forHTTPHeaderField:@"Content-Type"];
  [request setValue:@"application/x-protobuf" forHTTPHeaderField:@"Accept"];

  NSTimeInterval timeoutSec = MAX(timeoutMs.doubleValue / 1000.0, 0.001);
  request.timeoutInterval = timeoutSec;

  if (headersJson.length > 0) {
    NSData *jsonData = [headersJson dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError = nil;
    id parsed = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&jsonError];
    if (jsonError != nil) {
      reject(@"INVALID_ARGUMENT", @"headersJson is not valid JSON", jsonError);
      return;
    }
    if ([parsed isKindOfClass:[NSDictionary class]]) {
      NSDictionary *headers = (NSDictionary *)parsed;
      for (NSString *key in headers) {
        id value = headers[key];
        if ([value isKindOfClass:[NSString class]]) {
          [request setValue:(NSString *)value forHTTPHeaderField:key];
        } else if (value != nil && value != [NSNull null]) {
          [request setValue:[value description] forHTTPHeaderField:key];
        }
      }
    }
  }

  NSURLSessionConfiguration *config = [NSURLSessionConfiguration ephemeralSessionConfiguration];
  config.timeoutIntervalForRequest = timeoutSec;
  config.timeoutIntervalForResource = timeoutSec;
  NSURLSession *session = [NSURLSession sessionWithConfiguration:config];

  NSURLSessionDataTask *task = [session dataTaskWithRequest:request
                                          completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    if (error != nil) {
      reject(@"NETWORK", error.localizedDescription ?: @"Network request failed", error);
      return;
    }

    NSHTTPURLResponse *http = (NSHTTPURLResponse *)response;
    if (![http isKindOfClass:[NSHTTPURLResponse class]]) {
      reject(@"NETWORK", @"Unexpected non-HTTP response", nil);
      return;
    }

    if (http.statusCode < 200 || http.statusCode >= 300) {
      NSString *msg = [NSString stringWithFormat:@"HTTP %ld", (long)http.statusCode];
      reject(@"HTTP_ERROR", msg, nil);
      return;
    }

    NSData *responseData = data ?: [NSData data];
    NSString *responseBase64 = [responseData base64EncodedStringWithOptions:0];
    resolve(responseBase64 ?: @"");
  }];

  [task resume];
}

@end
