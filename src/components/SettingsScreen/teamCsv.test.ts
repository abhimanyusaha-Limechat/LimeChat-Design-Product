import { describe, expect, it } from 'vitest';
import type { BotTemplateRow } from '../BotTemplatesTable';
import { parseTeamCsv, TEAM_CSV_TEMPLATE } from './teamCsv';

const member = (id: string, email: string): BotTemplateRow => ({
  id,
  name: id,
  description: email,
  type: 'task',
  usecases: [],
  industries: [],
  scope: 'account',
});
const roster = [member('a', 'a@x.com'), member('b', 'b@x.com'), member('c', 'c@x.com')];
const ids = (result: ReturnType<typeof parseTeamCsv>) => ('levels' in result ? result.levels.map((l) => l.map((m) => m.id)) : result);

describe('parseTeamCsv', () => {
  it('groups members by level, ignoring case, blanks, CRLF and custom_id', () => {
    const csv = '﻿Email,Level,custom_id\r\nA@x.com,1,\r\n\r\nb@x.com,2,x1\r\nc@x.com,1,';
    expect(ids(parseTeamCsv(csv, roster))).toEqual([['a', 'c'], ['b']]);
  });

  it('accepts the downloadable template', () => {
    const real = [member('a', 'aarav@limechat.ai'), member('b', 'isha@limechat.ai')];
    expect(ids(parseTeamCsv(TEAM_CSV_TEMPLATE, real))).toEqual([['a'], ['b']]);
  });

  it.each([
    ['name,level\na@x.com,1', 'header'],
    ['email,level', 'no member rows'],
    ['email,level\nnobody@x.com,1', 'Row 2: nobody@x.com'],
    ['email,level\na@x.com,0', 'Row 2: level'],
    ['email,level\na@x.com,one', 'Row 2: level'],
    ['email,level\na@x.com,1\na@x.com,2', 'Row 3: a@x.com is listed more than once'],
    ['email,level\na@x.com,1\nb@x.com,3', 'level 2 has no members'],
  ])('rejects %j', (csv, message) => {
    const result = parseTeamCsv(csv, roster);
    expect('error' in result && result.error).toContain(message);
  });
});
