import type { ResumeData } from "@/types/resume";

/** Realistic dummy content for previewing templates in the admin editor. */
export const sampleResume: ResumeData = {
  personal: {
    firstName: "Amara",
    lastName: "Okafor",
    title: "Product Designer",
    email: "amara@example.com",
    phone: "+1 555 0142",
    location: "Lagos, Nigeria",
    website: "amara.design",
    linkedin: "linkedin.com/in/amaraokafor",
    github: "",
  },
  summary:
    "Product designer with six years of experience shipping accessible, data-heavy interfaces for fintech and logistics teams. Comfortable owning a problem from research through to production.",
  experience: [
    {
      id: "e1",
      jobTitle: "Senior Product Designer",
      company: "Northwind Labs",
      location: "Remote",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description:
        "Led the redesign of the onboarding flow, lifting completion from 54% to 71%.\nBuilt and documented a shared component library used by four squads.\nMentored two junior designers.",
    },
    {
      id: "e2",
      jobTitle: "Product Designer",
      company: "Paystream",
      location: "Lagos, Nigeria",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      description:
        "Designed the merchant dashboard used by 12,000 businesses.\nRan weekly usability sessions and turned findings into roadmap items.",
    },
  ],
  education: [
    {
      id: "d1",
      institution: "University of Lagos",
      degree: "B.Sc.",
      fieldOfStudy: "Computer Science",
      startDate: "2014-09",
      endDate: "2018-06",
      description: "",
    },
  ],
  skills: ["Figma", "User research", "Prototyping", "Design systems", "HTML & CSS", "Accessibility"].map(
    (name, i) => ({ id: `s${i}`, name }),
  ),
  projects: [
    {
      id: "p1",
      name: "Open Transit Map",
      description: "A community-maintained map of informal transit routes.\nUsed by 3 city planning groups.",
      url: "opentransit.example.org",
      technologies: "React, MapLibre",
    },
  ],
  certifications: [
    {
      id: "c1",
      name: "Certified Usability Analyst",
      organization: "HFI",
      issueDate: "2021-05",
      expirationDate: "",
      credentialUrl: "",
    },
  ],
  languages: [
    { id: "l1", language: "English", proficiency: "Native" },
    { id: "l2", language: "French", proficiency: "Conversational" },
  ],
  templateId: "",
};
