import { describe, expect, it } from 'vitest';
import { parseFlag } from './env';

describe('parseFlag', () => {
  it('falls back when the variable is unset or empty', () => {
    expect(parseFlag(undefined, true)).toBe(true);
    expect(parseFlag('', false)).toBe(false);
    expect(parseFlag('  ', true)).toBe(true);
  });

  it('reads "true" and "false" case-insensitively', () => {
    expect(parseFlag('true', false)).toBe(true);
    expect(parseFlag(' TRUE ', false)).toBe(true);
    expect(parseFlag('false', true)).toBe(false);
  });

  it('treats any other value as false', () => {
    expect(parseFlag('1', true)).toBe(false);
    expect(parseFlag('yes', true)).toBe(false);
  });
});
