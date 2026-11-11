import { getConversationContext } from '../lib/prompt-context';
import assert from 'node:assert/strict';
import { getScenarioConfig, getScenarioPrompt } from '../lib/agent-config';
import { getScenarioPresentation } from '../lib/presentation';
const config = getScenarioConfig();
assert.equal(config.id, "07-event-confirmation");
assert.equal(getScenarioPresentation().id, config.id);
for (const key of ['role', 'workflow', 'guardrails', 'greeting'] as const) assert.ok(config[key]);
assert.match(getScenarioPrompt(), /# Goal and conversation flow/);
assert.match(getScenarioPrompt(), /# First-version boundary/);
assert.match(getScenarioPrompt(), /No business data lookup/);
assert.doesNotMatch(getScenarioPrompt(), /AG-100[123]|patient-alex|AST-R3001|travelerKey|participantId/);
console.log('Scenario conversation contract passed: ' + config.id);

// Calendar regressions: U.S. dates can differ from UTC and offsets change with DST.
const localNight = getConversationContext('America/New_York', new Date('2026-11-05T02:30:00Z'));
assert.match(localNight, /Current local date: 2026-11-04/);
assert.match(localNight, /UTC-05:00/);
assert.match(getConversationContext('America/New_York', new Date('2026-03-08T06:30:00Z')), /UTC-05:00/);
assert.match(getConversationContext('America/New_York', new Date('2026-03-08T07:30:00Z')), /UTC-04:00/);
assert.match(getConversationContext('America/Chicago', new Date('2026-07-01T03:30:00Z')), /Current local date: 2026-06-30/);
assert.match(getConversationContext('America/New_York', new Date('2026-12-31T17:00:00Z')), /2027-01-01 Friday/);
assert.match(getConversationContext('America/New_York', new Date('2028-02-28T17:00:00Z')), /2028-02-29 Tuesday; 2028-03-01 Wednesday/);
console.log('Prompt local-date, DST and calendar regressions passed.');

function eventReference(now: Date) {
  const prompt = getScenarioPrompt(config.id, now);
  const reference = prompt.split('\n').find(line => line.startsWith('{"source":'));
  assert.ok(reference, 'The actual Agent prompt must include the event reference.');
  return JSON.parse(reference) as { session: { date: string; startsAt: string; endsAt: string; localStartTimes: Record<string, string> } };
}

// Reproduce the original expiry through the real prompt entry point.
const afterOldEvent = eventReference(new Date('2026-11-20T17:00:00Z'));
assert.equal(afterOldEvent.session.date, '2026-11-21', 'A new demo conversation must receive a future event after the old fixed date.');

// The date follows New York's calendar, including UTC/local disagreement,
// leap days and year rollover. All checks exercise the prompt used at startup.
for (const [instant, date] of [
  ['2026-11-05T02:30:00Z', '2026-11-05'],
  ['2026-12-31T18:00:00Z', '2027-01-01'],
  ['2028-02-28T18:00:00Z', '2028-02-29'],
  ['2030-06-30T23:00:00Z', '2030-07-01'],
]) {
  const now = new Date(instant);
  const reference = eventReference(now);
  assert.equal(reference.session.date, date);
  assert.ok(Date.parse(reference.session.startsAt) > now.getTime());
  assert.equal(Date.parse(reference.session.endsAt) - Date.parse(reference.session.startsAt), 45 * 60_000);
  assert.deepEqual(eventReference(now), reference, 'Repeated evaluation at one startup instant must be stable.');
}
// Today's offset differs from tomorrow's at the DST transitions.
const spring = eventReference(new Date('2027-03-13T18:00:00Z'));
assert.equal(spring.session.startsAt, '2027-03-14T14:00:00-04:00');
assert.equal(spring.session.endsAt, '2027-03-14T18:45:00.000Z');
assert.match(spring.session.localStartTimes['America/New_York'], /2:00 PM.*UTC-04:00/);
assert.match(spring.session.localStartTimes['America/Chicago'], /1:00 PM.*UTC-05:00/);
assert.match(spring.session.localStartTimes['America/Denver'], /12:00 PM.*UTC-06:00/);
assert.match(spring.session.localStartTimes['America/Los_Angeles'], /11:00 AM.*UTC-07:00/);
const fall = eventReference(new Date('2027-11-06T18:00:00Z'));
assert.equal(fall.session.startsAt, '2027-11-07T14:00:00-05:00');
assert.equal(fall.session.endsAt, '2027-11-07T19:45:00.000Z');
assert.match(fall.session.localStartTimes['America/New_York'], /2:00 PM.*UTC-05:00/);
assert.match(fall.session.localStartTimes['America/Chicago'], /1:00 PM.*UTC-06:00/);
assert.match(fall.session.localStartTimes['America/Denver'], /12:00 PM.*UTC-07:00/);
assert.match(fall.session.localStartTimes['America/Los_Angeles'], /11:00 AM.*UTC-08:00/);
assert.match(getScenarioPrompt(config.id, new Date('2026-11-20T17:00:00Z')), /Keep that exact supplied date and time fixed throughout this conversation/);
console.log('Generated future event dates, session stability and event-date DST conversions passed.');
