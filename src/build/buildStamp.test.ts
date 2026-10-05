import { describe, expect, it } from 'vitest';
import { buildStamp } from './buildStamp';

const now = new Date('2026-10-05T12:34:56Z');

describe('buildStamp', () => {
  it('uses the trimmed short SHA and the ISO build date', () => {
    expect(buildStamp(() => 'abc1234\n', now)).toEqual({ sha: 'abc1234', date: '2026-10-05' });
  });

  it('falls back to dev when git is unavailable', () => {
    const noGit = () => {
      throw new Error('git: command not found');
    };
    expect(buildStamp(noGit, now)).toEqual({ sha: 'dev', date: '2026-10-05' });
  });

  it('falls back to dev when git prints nothing', () => {
    expect(buildStamp(() => '', now).sha).toBe('dev');
  });
});
