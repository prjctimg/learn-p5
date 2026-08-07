import type { ReactNode } from "react";
import { jest } from "@jest/globals";

/**
 * Shared expo-router mock. Test files use it as:
 *
 *   jest.mock("expo-router", () => mockRouterModule);
 *
 * The `mock`-prefix on the binding name satisfies babel-plugin-jest-hoist's
 * out-of-scope rule so the factory is allowed to reference it.
 */
export const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  dismissTo: jest.fn(),
  setParams: jest.fn(),
};

export const mockRouterModule = {
  useRouter: () => mockRouter,
  useSegments: () => [],
  usePathname: () => "/",
  useLocalSearchParams: () => ({}),
  router: mockRouter,
  Link: ({ children }: { children: ReactNode }) => children,
  Stack: ({ children }: { children: ReactNode }) => children,
  Tabs: ({ children }: { children: ReactNode }) => children,
  Slot: ({ children }: { children: ReactNode }) => children,
  Redirect: () => null,
};
