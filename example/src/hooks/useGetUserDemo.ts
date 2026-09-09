import { useMemo, useState } from "react";
import { createDemoClient, formatCaughtError } from "../api";
import { DEMO_USER_ID, USE_MOCK_SERVER } from "../config/flags";
import { copy } from "../content/copy";

export function useGetUserDemo() {
  const api = useMemo(() => createDemoClient(), []);
  const [output, setOutput] = useState<string>(
    USE_MOCK_SERVER ? copy.mockIdle : copy.liveIdle,
  );
  const [loading, setLoading] = useState(false);

  async function callGetUser() {
    setLoading(true);
    setOutput(copy.calling);

    try {
      const getUser = api.userService?.getUser;
      if (!getUser) {
        throw new Error(copy.missingMethod);
      }

      const user = await getUser({ id: DEMO_USER_ID });
      setOutput(JSON.stringify(user, null, 2));
    } catch (error: unknown) {
      setOutput(formatCaughtError(error));
    } finally {
      setLoading(false);
    }
  }

  return {
    output,
    loading,
    callGetUser,
    subtitle: USE_MOCK_SERVER ? copy.mockHint : copy.liveHint,
  };
}
