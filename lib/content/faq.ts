export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Can I create a resume without an account?",
    answer:
      "Yes. Resonance is designed so you can start a resume without signing in. An account is optional — use it when you want to save your work and come back later.",
  },
  {
    question: "Do I need to sign up before creating a resume?",
    answer:
      "No. Sign in is available for people who want a saved workspace. It is not the starting point. You can begin from Create Resume.",
  },
  {
    question: "Can I change my resume template?",
    answer:
      "Yes. Pick a template in the editor and switch to another at any time: your content stays in place while the layout changes. Templates are managed from the product rather than fixed in the app.",
  },
  {
    question: "Can I download my resume?",
    answer:
      "PDF download is part of the planned editor workflow — preview your page, then export a print-ready file. Export will arrive with the builder; it is not a separate paid add-on described here.",
  },
  {
    question: "Can I edit my resume later?",
    answer:
      "You will be able to keep editing after you start. Guest sessions are for beginning immediately. Creating an account will let you return to a saved resume on another visit.",
  },
  {
    question: "How does saving work?",
    answer:
      "Saving is tied to a registered account. Guests can start without signing up; an account is how you keep a copy and reopen it later. Resume persistence for signed-in users is part of the next product stages, not something the public site submits today.",
  },
  {
    question: "Can I create more than one resume?",
    answer:
      "Support for more than one resume is planned for registered accounts, so you can tailor versions for different roles. That workspace is not available yet.",
  },
  {
    question: "Is my information stored securely?",
    answer:
      "Account sign-in uses our authentication provider with standard session practices. Profile data for signed-in users is stored in our database with access limited to the account that owns it. Resume content is not collected by these public pages. When resume saving ships, it will follow the same account-scoped approach. We do not sell personal information.",
  },
];

export const faqPreviewItems = faqItems.slice(0, 3);
