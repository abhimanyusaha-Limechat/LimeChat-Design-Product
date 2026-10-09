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

describe('open inbox', () => {
  it('round-trips on the Inboxes tab', () => {
    const screen = parseHash('#/helpdesk/settings?inbox=36421');
    expect(screen.inbox).toBe('36421');
    expect(toHash(screen)).toBe('#/helpdesk/settings?inbox=36421');
  });

  it('round-trips the inbox settings page, which needs an inbox', () => {
    const screen = parseHash('#/helpdesk/settings?inbox=36421&inboxView=settings');
    expect(screen.inboxSettings).toBe(true);
    expect(toHash(screen)).toBe('#/helpdesk/settings?inbox=36421&inboxView=settings');
    expect(parseHash('#/helpdesk/settings?inboxView=settings').inboxSettings).toBe(false);
  });

  it('is dropped outside the Inboxes tab or for an unusable id', () => {
    expect(parseHash('#/helpdesk/settings?tab=agents&inbox=36421').inbox).toBeNull();
    expect(parseHash('#/helpdesk/tickets?inbox=36421').inbox).toBeNull();
    expect(parseHash('#/helpdesk/settings?inbox=%3Cscript%3E').inbox).toBeNull();
  });
});
