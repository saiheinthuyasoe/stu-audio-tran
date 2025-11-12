import { useSyncExternalStore } from "react";

/**
 * Hook to detect if code is running on the client side
 * Prevents hydration mismatches between server and client rendering
 */
export function useIsClient() {
  const subscribe = () => () => {};
  const getSnapshot = () => true;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
