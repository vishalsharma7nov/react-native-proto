# Glossary (plain language)

| Term | Meaning |
|------|---------|
| **`.proto` file** | A text file that describes your API messages and services. |
| **Message** | A structured piece of data (for example `User` with `id` and `name`). |
| **Service** | A group of remote calls (for example `UserService`). |
| **RPC** | One remote call (for example `GetUser`). |
| **Encode** | Turn a JS object into binary protobuf bytes. |
| **Decode** | Turn binary bytes back into a JS object. |
| **Transport** | How bytes travel to the server (`http`, `connect`, or `native-grpc`). |
| **Client** | The object you call: `api.userService.getUser(...)`. |
| **Method map** | A list of services/methods generated from your protos. |
| **Config file** | Your app’s `react-native-proto.config.ts` with URL and auth. |
| **GitHub Packages** | GitHub’s npm registry used to host this package. |
