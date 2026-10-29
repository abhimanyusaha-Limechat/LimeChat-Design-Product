/**
 * Teams → Edit: the bulk-upload CSV. One row per member: `email,level,custom_id`.
 * Members are the account's collaborators, matched by email; `custom_id` is optional and unused for now.
 * Parsing is all-or-nothing: the first problem is reported with its row number and nothing is imported.
 */
import type { BotTemplateRow } from '../BotTemplatesTable';

export const TEAM_CSV_TEMPLATE = 'email,level,custom_id\naarav@limechat.ai,1,\nisha@limechat.ai,2,\n';

export type TeamCsvResult = { levels: BotTemplateRow[][] } | { error: string };

// ponytail: plain comma split, no quoted fields (emails, levels and ids never contain commas); use a CSV lib if that changes.
export function parseTeamCsv(text: string, roster: BotTemplateRow[]): TeamCsvResult {
  const lines = text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .map((line, i) => ({ row: i + 1, cells: line.split(',').map((c) => c.trim()) }))
    .filter(({ cells }) => cells.some(Boolean));

  const header = lines.shift()?.cells.map((c) => c.toLowerCase()) ?? [];
  const emailCol = header.indexOf('email');
  const levelCol = header.indexOf('level');
  if (emailCol < 0 || levelCol < 0) return { error: 'The first row must be a header with email and level columns.' };
  if (lines.length === 0) return { error: 'The file has no member rows.' };

  const byEmail = new Map(roster.map((member) => [member.description.toLowerCase(), member]));
  const byLevel = new Map<number, BotTemplateRow[]>();
  const seen = new Set<string>();
  for (const { row, cells } of lines) {
    const email = (cells[emailCol] ?? '').toLowerCase();
    const level = Number(cells[levelCol]);
    const member = byEmail.get(email);
    if (!email) return { error: `Row ${row}: enter an email.` };
    if (!Number.isInteger(level) || level < 1) return { error: `Row ${row}: level must be a whole number, 1 or more.` };
    if (!member) return { error: `Row ${row}: ${email} isn't a collaborator on this account.` };
    if (seen.has(email)) return { error: `Row ${row}: ${email} is listed more than once.` };
    seen.add(email);
    byLevel.set(level, [...(byLevel.get(level) ?? []), member]);
  }

  const numbers = [...byLevel.keys()].sort((a, b) => a - b);
  const gap = numbers.findIndex((n, i) => n !== i + 1);
  if (gap >= 0) return { error: `Levels must run 1, 2, 3 without gaps; level ${gap + 1} has no members.` };
  return { levels: numbers.map((n) => byLevel.get(n) ?? []) };
}
