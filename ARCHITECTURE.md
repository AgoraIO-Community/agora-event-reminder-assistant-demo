# Event Reminder Assistant Architecture

## Components

The browser uses Agora RTC for audio and RTM for transcript and Agent events. Next.js only signs credentials and starts/stops the managed Agent. No business session, data API, local file store or persistent application database is required. Native Node.js, Docker and a Next.js-compatible serverless deployment use the same conversation flow. Actual hosted voice acceptance remains a separate check.

## Session time limit

LandingPage enforces a ten-minute browser session deadline from successful startup. It reuses the manual stop flow, checks wall time every second and on focus/visibility changes, and retries failed stops every five seconds. Successful stop retains the transcript and shows a timeout notice; starting again resets the deadline. Effect cleanup removes the timer/listeners. This is not a server-side usage cap: closed pages, suspended devices and network failures can delay Agent shutdown.

The conversation header shows a small, muted countdown (10:00 left) immediately before the connection status. The last minute is highlighted, with an automatic-stop notice for screen readers. At the deadline the timer stays at 00:00 until stopping succeeds. Screen readers do not announce every tick.

## Start and stop

The page requests an RTC/RTM token and starts the managed Agent using requester_id and channel_name. RTM is ready before the RTC conversation component mounts. End conversation stops the Agent, logs out RTM and unmounts hook-owned media. No customer, shopping, follow-up or event session participates in startup.

## State

Scenario instructions and static public reference material are bundled with the app. Current-call transcript, activity and Inspector state live in browser memory. There is no business Map, writable result file, business API or application database.

## Ownership and invariants

LandingPage owns bootstrap and RTM. ConversationComponent owns RTC/toolkit subscriptions and uses the StrictMode guard. Preserve local-user UID normalization and interrupted turns. Token, invite and stop routes own privileged operations. lib/agent-tools.ts always returns an empty list.

## Deployment

The browser uses Agora RTC for audio and RTM for transcript and Agent events. Next.js only signs credentials and starts/stops the managed Agent. No business session, data API, local file store or persistent application database is required. Native Node.js, Docker and a Next.js-compatible serverless deployment use the same conversation flow. Actual hosted voice acceptance remains a separate check.

Supply NEXT_PUBLIC_AGORA_APP_ID at build and runtime and keep NEXT_AGORA_APP_CERTIFICATE server-only. No persistent volume is required. Synthetic verification does not prove real speech or hosted reachability.

## Usage FAQ ownership

`components/ScenarioFaq.tsx` owns static usage answers; `styles/faq.css` owns disclosure styling, scrolling and transitions. Its header trigger and content share a Radix Dialog root in `LandingPage`. Dialog handles focus trapping, Escape/backdrop dismissal and returning focus to the trigger. FAQ has no session or business API calls.


## Phase-one conversation update — 2026-11-08

Hear a reminder for a fictional webinar, review its schedule and say whether you plan to attend. This first version is conversation-only. No business data lookup, external tools, database, record writes, saved results, or cross-session business history are available. Keep details in the current conversation. Do not claim a real registration, reminder, survey submission, callback, payment or saved result. Do not request secrets or unnecessary personal identifiers.

See [current capabilities](README.md#what-you-can-do), the [conversation contract](ARCHITECTURE.md#conversation-behavior) and [verification guidance](AGENTS.md#verification-and-maintenance). Tools remain disabled, and no persistent business operations are provided.

## Conversation behavior

### Conversation flow

Act as a proactive reminder and attendance-confirmation role-play for the one configured fictional webinar, not a general event search or personal reminder scheduler. The greeting asks permission to give a short reminder. If the caller agrees, introduce the event title, exact date, local start/end time, time zone and online format, then ask one question about whether they plan to attend. If they already state their intention or ask an agenda/timing question, acknowledge or answer first rather than repeating permission or intake.

Use the supplied date context and generated event session. Each new conversation receives a fictional event on the following New York calendar day at 2 PM. Keep that exact supplied date and time fixed throughout this conversation, including across midnight, and never regenerate or roll it forward yourself. If the current date is after the session date, say this example event has passed; discuss the sample agenda if useful but do not ask the caller to attend a past event or invent another date. If it is the same date, give the schedule without claiming the session is still upcoming, underway or finished from date alone.

Keep the fixed event information separate from the caller's attendance intention. Accept attending, not attending or undecided; ask at most one useful clarification if the intention is ambiguous, then recap it. Do not pressure someone who declines. If the caller corrects the intention, use the correction in the current conversation. No attendance response is saved or submitted.

Answer agenda, audience, location and joining questions from the reference. Give exact listed U.S. time conversions when relevant. Do not ask the caller to find their email merely to learn public timing. No join URL is configured, so distinguish an existing real attendee's personal confirmation link from this fictional role-play; do not invent a link, assume the caller is registered or send them elsewhere to join this fictional event.

If asked to set a reminder, add a calendar entry, register or receive a recording, explain the specific unavailable action and continue with a concise event/intent recap the caller can use manually. Do not collect an arbitrary new event as if a reminder will be scheduled. A recording is planned in the example, not known to exist. Close with the exact event schedule and the caller's stated attendance intention, making clear that this is only a conversational recap and nothing was registered, scheduled, emailed or saved.

### Capability boundary

This is a fictional example webinar with a configured schedule, not evidence of a real Agora event announcement. No attendee, personal registration, event updates or email/calendar system is connected. Do not assume the caller is registered, invent personal links or alternative sessions, update attendance, promise a recording, send an invitation or arrange a callback. Distinguish planned recording information from an available recording.

### Source ownership

- `lib/agent-config.ts`: role, greeting, workflow and guardrails.
- `lib/prompt-context.ts`: short-turn rules and U.S. local date/DST context.
- `lib/scenario-knowledge.ts`: teaching material or configured fictional reference.
- `lib/presentation.ts` and `components/ScenarioFaq.tsx`: matching entry and FAQ.

No reference generation performs a business lookup or saves state. Fictional addresses are demonstration text, not real navigation destinations.

## Generated demonstration event schedule

Like the hotel and parent-trial demos, `getScenarioKnowledge(now)` generates dates from the business-local calendar at startup. `getDemoDates` supplies the New York calendar dates; the webinar starts the following day at 2 PM and lasts 45 minutes. Its offset is computed for the event date, including U.S. daylight-saving transitions. Eastern, Central, Mountain and Pacific start labels are all formatted from the same event instant.

`getScenarioPrompt` captures one clock value for both current-date context and the event reference. The invite route calls it for every new Agent; no module-level prompt snapshot freezes the event at import or deployment time. The configured schedule remains fixed for the current conversation, even across midnight. A new conversation receives a new future demonstration date. This generates fictional reference material, not a real event listing, personal reminder or rescheduled event.

Scenario regressions cover the original expired date, later years, business-local/UTC disagreement, leap days, year rollover, spring/fall offsets and 45-minute duration. The mocked Agent startup test advances the clock after importing the route and checks that a later conversation receives the new schedule without restarting the process. Real speech and hosted behavior require separate acceptance.

## Token lifetime compatibility

Browser RTC/RTM tokens and server-side Agent/REST tokens use the shared ten-minute `TOKEN_LIFETIME_SECONDS` duration. Token builders take durations, not Unix expiry timestamps. Keep the App Certificate and ConvoAI-capable REST tokens on the server.

The Agent start/stop routes explicitly mint tokens with `ConvoAITokenBuilder.buildToken` and pass the supported SDK `authToken` / session `token` options. This avoids the `agora-agents` 2.14.0 / `agora-token` 2.0.7 positional-argument mismatch: the SDK helper otherwise treats publisher role `1` as a one-second token lifetime. Do not patch installed dependencies or add blanket overrides. `verify:api` exercises the real SDK serialization with intercepted network transport, decodes and verifies actual signed tokens, and checks a 600-second lifetime for browser, REST start, Agent RTC/RTM and REST stop tokens. Revisit the explicit-token compatibility path only after an upstream SDK correction passes this regression and live acceptance.

## Lint dependency security compatibility

The registry audit reports GHSA-g3hv-75wg-m249 in minimatch 10.2.6, including the latest typescript-estree 8.72.2 dependency range. A parent-scoped pnpm override selects minimatch 11.0.1 only for `@typescript-eslint/typescript-estree>minimatch`; it does not replace unrelated consumers. Node.js 24 satisfies its runtime requirement, and the caller uses the retained CommonJS `minimatch` function with `dot: true`. Recheck and remove this compatibility override when the upstream dependency range includes a patched version. Run the complete verification suite and an official-registry audit after lockfile updates.
