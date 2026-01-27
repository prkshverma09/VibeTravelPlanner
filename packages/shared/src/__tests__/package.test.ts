import { describe, it, expect } from 'vitest';

describe('Shared Package', () => {
  it('should export from main entry point', async () => {
    const exports = await import('../index');
    expect(exports).toBeDefined();
  });
});
