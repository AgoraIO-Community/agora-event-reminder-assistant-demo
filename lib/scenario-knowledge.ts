import { getDemoDates } from './prompt-context';

// Public reference only. Keep private records, live inventory and business actions out of this module.
export const SCENARIO_KNOWLEDGE = {
  "source": {
    "kind": "Fictional event reference",
    "revision": "2026-11-10",
    "scope": "One fictional session generated at conversation startup; not a real event listing, attendee record or live event update."
  },
  "timeZone": "America/New_York",
  "title": "Building better customer conversations",
  "organizer": "Agora (fictional example event)",
  "location": "Online webinar",
  "description": "A practical session on designing helpful voice experiences, with examples and a live Q&A.",
  "demoSchedule": {
    "daysAhead": 1,
    "startHour": 14,
    "durationMinutes": 45,
    "description": "Each new conversation uses a fictional event on the following New York calendar day. The generated session remains fixed throughout that conversation."
  },
  "agenda": [
    {
      "minutes": 15,
      "topic": "Understand the user's goal and ask useful follow-up questions"
    },
    {
      "minutes": 20,
      "topic": "Examples of voice-agent conversations and capability boundaries"
    },
    {
      "minutes": 10,
      "topic": "Live Q&A"
    }
  ],
  "audience": "People designing or evaluating voice experiences, including product, support and development teams.",
  "joining": "A personal join link would come from the attendee's existing registration confirmation. No public or personal join URL is configured here.",
  "recording": "A recording is planned in the example. Publication, availability and delivery are unconfirmed; discussing interest does not send or request it."
} as const;

export function getScenarioKnowledge(now = new Date()) {
  const { timeZone, demoSchedule } = SCENARIO_KNOWLEDGE;
  const date = getDemoDates(timeZone, now)[demoSchedule.daysAhead];
  // The fixed 2 PM New York event is after the U.S. early-morning DST transition.
  // Use the event date's offset, rather than today's offset, for its local start.
  const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(new Date(date + 'T12:00:00Z')).find(part => part.type === 'timeZoneName')!.value.replace('GMT', '');
  const startsAt = `${date}T${String(demoSchedule.startHour).padStart(2, '0')}:00:00${offset}`;
  const start = new Date(startsAt);
  const endsAt = new Date(start.getTime() + demoSchedule.durationMinutes * 60_000).toISOString();
  const localStartTimes = Object.fromEntries([
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  ].map(zone => {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    }).format(start);
    const utcOffset = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
      .formatToParts(start).find(part => part.type === 'timeZoneName')!.value.replace('GMT', 'UTC');
    return [zone, `${formatted} (${utcOffset})`];
  }));
  return { ...SCENARIO_KNOWLEDGE, session: {
    date, startsAt, endsAt, durationMinutes: demoSchedule.durationMinutes, timeZone, localStartTimes,
  } };
}
