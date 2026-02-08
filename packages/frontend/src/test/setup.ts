import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: function MockImage({ 
    src, 
    alt, 
    fill,
    ...props 
  }: { 
    src: string; 
    alt: string; 
    fill?: boolean;
    [key: string]: unknown;
  }) {
    return React.createElement('img', { src, alt, ...props });
  },
}));

vi.mock('react-instantsearch', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    Chat: function MockChat({ 
      agentId, 
      classNames,
      userMessageLeadingComponent,
      assistantMessageLeadingComponent,
      headerTitleIconComponent,
      translations,
      itemComponent,
      tools,
    }: { 
      agentId: string; 
      classNames?: Record<string, unknown>;
      userMessageLeadingComponent?: React.ComponentType;
      assistantMessageLeadingComponent?: React.ComponentType;
      headerTitleIconComponent?: React.ComponentType;
      translations?: Record<string, unknown>;
      itemComponent?: React.ComponentType;
      tools?: Record<string, unknown>;
    }) {
      return React.createElement('div', {
        'data-testid': 'algolia-chat',
        'data-agent-id': agentId,
        className: typeof classNames?.root === 'string' ? classNames.root : '',
        'data-has-user-avatar': !!userMessageLeadingComponent,
        'data-has-assistant-avatar': !!assistantMessageLeadingComponent,
        'data-has-header-icon': !!headerTitleIconComponent,
        'data-has-translations': !!translations,
        'data-has-item-component': !!itemComponent,
        'data-has-tools': !!tools,
        'data-tools-count': tools ? Object.keys(tools).length : 0,
      }, 'Mock Algolia Chat Widget');
    },
  };
});
