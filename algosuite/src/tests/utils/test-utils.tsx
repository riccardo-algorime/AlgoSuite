import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { ColorModeProvider } from '../../components/ui/color-mode';
import { MemoryRouter } from 'react-router-dom';

/**
 * Create a new QueryClient for testing purposes
 * This ensures each test has a fresh QueryClient instance
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries to make testing easier
        retry: false,
      },
    },
    // Silence errors in console during tests
    // In newer versions of @tanstack/react-query, logger is not part of QueryClientConfig
    // We'll handle logging differently
  });

/**
 * Create a wrapper component with a fresh QueryClient
 * This is used to wrap components or hooks in tests
 */
export function createWrapper() {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
}

/**
 * Render a hook with a fresh QueryClient
 * This is a convenience function for testing hooks
 */
export function renderHookWithClient<TProps, TResult>(
  hook: (props: TProps) => TResult,
  initialProps?: TProps
) {
  return renderHook(hook, {
    wrapper: createWrapper(),
    initialProps,
  });
}

/**
 * Custom render function that wraps components with both ChakraProvider and QueryClientProvider
 * This is used for testing components that use Chakra UI and React Query
 */
// Create a system for testing
const testSystem = createSystem(defaultConfig);

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  return (
    <ChakraProvider value={testSystem}>
      <ColorModeProvider>
        <MemoryRouter>
          <QueryClientProvider client={testQueryClient}>
            {children}
          </QueryClientProvider>
        </MemoryRouter>
      </ColorModeProvider>
    </ChakraProvider>
  );
};

/**
 * Custom render function for testing components with all providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });
