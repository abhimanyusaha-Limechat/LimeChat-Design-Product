import { describe, expect, it } from 'vitest';
import { parseHash, toHash, toScreen } from './navigationHash';

describe('parseHash', () => {
  it('reads product and sidebar item', () => {
    expect(parseHash('#/marketing/segments')).toMatchObject({ product: 'marketing', selected: 'segments' });
  });

  it('accepts footer items', () => {
    expect(parseHash('#/marketing/whatsapp')).toMatchObject({ product: 'marketing', selected: 'whatsapp' });
  });

  it('ignores query parameters', () => {
    expect(parseHash('#/automation/flows?comment=12&x')).toMatchObject({ product: 'automation', selected: 'flows' });
  });

  it.each(['', '#', '#/', 'garbage', '#/nope/tickets', '#/toString/tickets', '#//'])(
    'falls back to Helpdesk Tickets for %j',
    (hash) => {
      expect(parseHash(hash)).toMatchObject({ product: 'helpdesk', selected: 'tickets' });
    },
  );

  it.each(['#/marketing', '#/marketing/', '#/marketing/tickets', '#/marketing/constructor'])(
    "falls back to the product's first item for %j",
    (hash) => {
      expect(parseHash(hash)).toMatchObject({ product: 'marketing', selected: 'home' });
    },
  );
});

describe('toHash', () => {
  it('round-trips through parseHash', () => {
    const screen = toScreen({ product: 'automation', selected: 'knowledge-base' });
    expect(toHash(screen)).toBe('#/automation/knowledge-base');
    expect(parseHash(toHash(screen))).toMatchObject(screen);
  });
});

describe('ticket', () => {
  it('reads and writes the open ticket, leaving the first one out', () => {
    expect(parseHash('#/helpdesk/tickets?ticket=t-6').ticket).toBe('t-6');
    expect(toHash(parseHash('#/helpdesk/tickets?ticket=t-6'))).toBe('#/helpdesk/tickets?ticket=t-6');
    expect(toHash(parseHash('#/helpdesk/tickets?ticket=t-1'))).toBe('#/helpdesk/tickets');
  });

  it.each(['#/helpdesk/tickets?ticket=nope', '#/helpdesk/contacts?ticket=t-6', '#/marketing/home?ticket=t-6'])(
    'falls back to the first ticket for %j',
    (hash) => {
      expect(parseHash(hash).ticket).toBe('t-1');
      expect(toHash(parseHash(hash))).not.toContain('ticket=');
    },
  );
});
