/** The exactly-3 discovery questions (README Step 4). */

export interface DiscoveryQuestion {
  /** Maps to a key in DiscoveryAnswers. */
  key: "likes" | "dislikes" | "priority";
  prompt: string;
  options: string[];
}

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    key: "likes",
    prompt: "What type of work energizes you the most?",
    options: [
      "Building Products",
      "Solving Technical Problems",
      "Leading People",
      "Working With Customers",
    ],
  },
  {
    key: "dislikes",
    prompt: "What kind of work feels repetitive or draining?",
    options: ["Meetings", "Customer Calls", "Repetitive Tasks", "Coding"],
  },
  {
    key: "priority",
    prompt: "What matters most in your next role?",
    options: [
      "Salary",
      "Learning",
      "Ownership",
      "Stability",
      "Work-Life Balance",
    ],
  },
];
