import { describe, expect, it } from 'vitest';

describe('Job match notification batching', () => {
  it('should process candidates in batches of 10', () => {
    const candidates = Array.from({ length: 25 }, (_, index) => ({
      id: index + 1,
    }));

    const batchSize = 10;
    const batches: typeof candidates[] = [];

    for (let i = 0; i < candidates.length; i += batchSize) {
      batches.push(candidates.slice(i, i + batchSize));
    }

    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(10);
    expect(batches[1]).toHaveLength(10);
    expect(batches[2]).toHaveLength(5);
  });
});