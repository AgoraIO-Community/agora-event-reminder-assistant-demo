import type { ScenarioPresentation } from '@/types/presentation';
export type { ScenarioPresentation } from '@/types/presentation';

export const presentation: ScenarioPresentation = {
  "id": "07-event-confirmation",
  "name": "Event Reminder Assistant",
  "purpose": "Event reminder and attendance intention",
  "summary": "Hear a reminder for a fictional webinar, review its schedule and say whether you plan to attend.",
  "featuresHeading": "In this conversation",
  "features": [
    {
      "emoji": "💬",
      "title": "Proactive webinar reminder"
    },
    {
      "emoji": "🎙️",
      "title": "Exact schedule & time zones"
    },
    {
      "emoji": "📝",
      "title": "Attendance intention recap"
    }
  ],
  "builtWith": [
    "Agora Conversational AI",
    "Agents SDK",
    "Next.js"
  ],
  "startLabel": "Start event reminder",
  "boundaryShort": "Practice reminder only. No attendance is saved, and no calendar entry, notification or email is scheduled.",
  "outcomes": [
    {
      "id": "helpful",
      "label": "The conversation helped"
    },
    {
      "id": "needs-guidance",
      "label": "I need more guidance"
    }
  ],
  "developer": {
    "sourceUrl": "https://github.com/AgoraIO-Community/agora-event-reminder-assistant-demo",
    "runCommand": "pnpm install --frozen-lockfile\npnpm run doctor\npnpm run dev",
    "skillsCommand": "npx skills add github:AgoraIO/skills",
    "assistantPrompt": "Work in this existing Event Reminder Assistant voice demo. Preserve RTC/RTM and the phase-one conversation-only boundary. Use configured fictional references and explicitly labeled current-conversation simulations where supported. Keep tools disabled, results unsaved and real business actions unavailable. Keep entry copy, FAQ and prompt behavior aligned.",
    "docsUrl": "https://docs.agora.io/en/ai/build/build-server-client",
    "sdkUrl": "https://www.npmjs.com/package/agora-agents",
    "consoleUrl": "https://console.agora.io/",
    "cliUrl": "https://github.com/AgoraIO/cli",
    "skillsUrl": "https://github.com/AgoraIO/skills",
    "extensionPoints": [
      {
        "title": "Change the conversation",
        "path": "lib/agent-config.ts"
      },
      {
        "title": "Choose models and voice",
        "path": "lib/runtime-profile.ts"
      },
      {
        "title": "Adapt scenario UI copy",
        "path": "lib/presentation.ts"
      }
    ]
  }
};

export function getScenarioPresentation(): ScenarioPresentation { return presentation; }
