import assert from 'node:assert/strict';
import { mock } from 'node:test';
import fs from 'node:fs';
import { Agent } from 'agora-agents';
import { NextRequest } from 'next/server';
import { getScenarioTools } from '../lib/agent-tools';
import { getScenarioConfig, getScenarioPrompt } from '../lib/agent-config';
import { getScenarioPresentation } from '../lib/presentation';

async function main() {
  const config = getScenarioConfig();
  assert.equal(getScenarioPresentation().id, config.id);
  assert.deepEqual(getScenarioTools(), []);
  assert.match(getScenarioPrompt(), /conversation-only|No external tools/);
  const landing = fs.readFileSync('components/LandingPage.tsx', 'utf8');
  assert.doesNotMatch(landing, /api\/scenarios|shopping_session_id|event_session_id|followUpApi|useShopping|useFollowUps/);

  process.env.NEXT_PUBLIC_AGORA_APP_ID = '0123456789abcdef0123456789abcdef';
  process.env.NEXT_AGORA_APP_CERTIFICATE = 'fedcba9876543210fedcba9876543210';
  const { POST } = await import('../app/api/invite-agent/route');
  const originalCreate = Agent.prototype.createSession;
  const originalOrigin = process.env.TOP_TEN_SCENARIO_TOOL_BASE_URL;
  let captured: Agent | null = null;
  let sessionOptions: unknown;
  let starts = 0;
  Agent.prototype.createSession = (function (this: Agent, options: unknown) {
    captured = this;
    sessionOptions = options;
    return { start: async () => { starts += 1; return 'conversation-only-agent'; } };
  }) as unknown as typeof Agent.prototype.createSession;
  mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-20T17:00:00Z') });
  try {
    for (const origin of [undefined, 'https://legacy-tools.example.test']) {
      if (origin) process.env.TOP_TEN_SCENARIO_TOOL_BASE_URL = origin;
      else delete process.env.TOP_TEN_SCENARIO_TOOL_BASE_URL;
      const response = await POST(new NextRequest('http://localhost/api/invite-agent', {
        method: 'POST',
        body: JSON.stringify({ requester_id: 'voice-user', channel_name: 'voice-only-channel' }),
      }));
      const result = await response.json();
      assert.equal(response.status, 200, 'A voice conversation must start without a business session: ' + JSON.stringify(result));
      assert.equal(result.agent_id, 'conversation-only-agent');
      const actual = captured as unknown as Agent;
      assert.equal(actual.advancedFeatures?.enable_rtm, true);
      assert.equal(actual.advancedFeatures?.enable_tools, false);
      assert.deepEqual(actual.llm?.tools ?? [], []);
      assert.deepEqual((sessionOptions as { remoteUids: string[] }).remoteUids, ['voice-user']);
      assert.equal(actual.instructions, getScenarioPrompt(config.id));
      assert.match(actual.instructions!, /"date":"2026-11-21"/);
    }
    assert.equal(starts, 2);
    // The already-imported startup route must generate a new event on a later day.
    mock.timers.setTime(new Date('2026-11-22T17:00:00Z').getTime());
    const later = await POST(new NextRequest('http://localhost/api/invite-agent', {
      method: 'POST', body: JSON.stringify({ requester_id: 'voice-user', channel_name: 'later-demo-channel' }),
    }));
    assert.equal(later.status, 200);
    assert.match((captured as unknown as Agent).instructions!, /"date":"2026-11-23"/);
    assert.doesNotMatch((captured as unknown as Agent).instructions!, /"date":"2026-11-21"/);
    assert.equal(starts, 3);
  } finally {
    mock.timers.reset();
    Agent.prototype.createSession = originalCreate;
    if (originalOrigin === undefined) delete process.env.TOP_TEN_SCENARIO_TOOL_BASE_URL;
    else process.env.TOP_TEN_SCENARIO_TOOL_BASE_URL = originalOrigin;
  }
  console.log('Conversation-only startup, disabled tools and business-free page passed: ' + config.id);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
