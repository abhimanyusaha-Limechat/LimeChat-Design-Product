import { describe, expect, it } from 'vitest';
import { agentLoginsLine, type PlanTier } from './ChangePlan';

const tier = (includedAgents: number): PlanTier => ({
  id: String(includedAgents),
  name: `Tier ${includedAgents}`,
  pricePerMonth: 0,
  extraTicketPrice: 0,
  includedAgents,
  highlights: [],
});

describe('agentLoginsLine', () => {
  it('says how many logins the first tier has', () => {
    expect(agentLoginsLine(tier(3))).toBe('3 agent logins');
  });

  it('says what it is up from when the previous tier had fewer', () => {
    expect(agentLoginsLine(tier(5), tier(3))).toBe('5 agent logins (up from 3)');
  });

  it('leaves out "up from" when the count did not grow', () => {
    expect(agentLoginsLine(tier(5), tier(5))).toBe('5 agent logins');
  });
});
