'use client';

import { ChevronDown } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const questions = [
  {
    question: 'How long does a session last?',
    answer: 'Each session ends automatically after 10 minutes; choose Start again to continue.',
  },
  {
    "question": "How do I start a conversation?",
    "answer": "Choose Start event reminder and allow microphone access when your browser asks. Speak in English and describe what you need. You can mute the microphone or end the conversation with the voice controls."
  },
  {
    "question": "What should I say?",
    "answer": "Agree to hear the reminder, ask a schedule or agenda question, or say whether you plan to attend. Try: “Yes, please remind me. What time is it in California?” You can say no or remain undecided."
  },
  {
    "question": "What is this assistant intended to do?",
    "answer": "It demonstrates a proactive reminder and attendance-intention conversation for one fictional webinar, Building better customer conversations. Each new conversation uses a fictional online event on the following day in New York, from 2 to 2:45 PM Eastern (11 to 11:45 AM Pacific). The assistant gives the exact date and date-correct time zones. That schedule stays fixed for the conversation."
  },
  {
    "question": "Can it set my own reminder or register me?",
    "answer": "No. It does not create personal reminders, send notifications, add calendar entries or register attendees. Your attendance intention is discussed and recapped only in this conversation; it is not saved or sent to an organizer."
  },
  {
    "question": "Where is the join link or recording?",
    "answer": "No join link is configured for this fictional event. A real attendee would use their own registration confirmation. Recording is planned only in the example; no recording availability or delivery is guaranteed."
  },
  {
    "question": "Can I change what I said?",
    "answer": "Yes. Tell the assistant which detail to correct, ask it to repeat or clarify an answer, or request a verbal recap. Details are used within the current conversation; this demo does not save business results or remember them across sessions."
  },
  {
    "question": "What if my microphone does not work?",
    "answer": "Check that microphone access is allowed for this page and that the correct input device is selected in your browser or system settings. Make sure the microphone is not muted, then try Start event reminder again."
  }
];

export function ScenarioFaq() {
  return (
    <DialogContent className="demo-inspector demo-faq-drawer">
      <DialogHeader className="demo-faq-heading">
        <DialogTitle>Frequently asked questions</DialogTitle>
        <DialogDescription>How to get started, what to ask, and what to expect.</DialogDescription>
      </DialogHeader>
      <div className="demo-faq-list">
        {questions.map(({ question, answer }) => (
          <details className="demo-faq-item" key={question}>
            <summary>
              <span>{question}</span>
              <ChevronDown className="demo-faq-chevron" size={16} aria-hidden="true" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </DialogContent>
  );
}
