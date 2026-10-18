import { describe, expect, it } from 'vitest';
import { splitHighlight } from './highlight';

describe('splitHighlight', () => {
  it('splits around the first case-insensitive match, keeping the original casing', () => {
    expect(splitHighlight('LoRA closes the gap; LoRA wins.', 'lora')).toEqual({
      pre: '',
      highlight: 'LoRA',
      post: ' closes the gap; LoRA wins.',
    });
  });

  it('returns null when there is nothing to highlight', () => {
    expect(splitHighlight('Some text', undefined)).toBeNull();
    expect(splitHighlight('Some text', '')).toBeNull();
    expect(splitHighlight('Some text', 'missing')).toBeNull();
  });
});
