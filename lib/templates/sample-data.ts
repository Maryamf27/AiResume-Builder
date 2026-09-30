import type { ResumeData } from "@/types/resume";

export const sampleResume: ResumeData = {
  personal: {
    firstName: "Alex",
    lastName: "Morgan",
    title: "Software Engineer",
    email: "email@example.com",
    phone: "+1 000 000 0000",
    location: "Austin, TX",
    website: "alexmorgan.example.com",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan",
  },
  summary:
    "Software engineer with seven years of experience building reliable web platforms and internal tools. Comfortable across the stack, with a focus on performance, clear APIs and mentoring. Enjoys turning ambiguous problems into well-scoped, shipped work.",
  experience: [
    {
      id: "e1",
      jobTitle: "Senior Software Engineer",
      company: "Northwind Systems",
      location: "Austin, TX",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description:
        "Led a team of four rebuilding the customer billing platform, cutting invoice errors by 38%.\nReduced p95 API latency from 480 ms to 190 ms by redesigning caching and query patterns.\nIntroduced code review guidelines and a mentoring programme for six junior engineers.",
    },
    {
      id: "e2",
      jobTitle: "Software Engineer",
      company: "Brightpath Labs",
      location: "Remote",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      description:
        "Built and maintained a React and Node.js scheduling product used by 40,000 monthly users.\nMigrated a monolithic service to independently deployed services with zero customer downtime.\nAutomated release testing, shortening the release cycle from two weeks to three days.",
    },
    {
      id: "e3",
      jobTitle: "Junior Developer",
      company: "Harbor Digital",
      location: "Dallas, TX",
      startDate: "2017-08",
      endDate: "2019-05",
      current: false,
      description:
        "Delivered features for client web applications in JavaScript and PostgreSQL.\nWrote the internal documentation used to onboard new developers.",
    },
  ],
  education: [
    {
      id: "d1",
      institution: "University of Texas at Austin",
      degree: "B.S.",
      fieldOfStudy: "Computer Science",
      startDate: "2013-09",
      endDate: "2017-05",
      description: "Graduated with honours. Senior thesis on distributed caching strategies.",
    },
    {
      id: "d2",
      institution: "Austin Community College",
      degree: "Certificate",
      fieldOfStudy: "Data Analytics",
      startDate: "2018-01",
      endDate: "2018-12",
      description: "",
    },
  ],
  skills: [
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "System design",
    "REST and GraphQL APIs",
    "AWS",
    "Docker",
    "CI/CD",
    "Testing",
    "Mentoring",
    "Technical writing",
  ].map((name, i) => ({ id: `s${i}`, name })),
  projects: [
    {
      id: "p1",
      name: "Open Schedule",
      description:
        "An open-source scheduling library with 1,200 stars on GitHub.\nMaintained by five contributors across three time zones.",
      url: "github.com/alexmorgan/open-schedule",
      technologies: "TypeScript, PostgreSQL",
    },
    {
      id: "p2",
      name: "Deploy Dashboard",
      description: "Internal dashboard giving teams a single view of deployment health and rollbacks.",
      url: "",
      technologies: "React, Node.js",
    },
  ],
  certifications: [
    {
      id: "c1",
      name: "AWS Certified Developer – Associate",
      organization: "Amazon Web Services",
      issueDate: "2021-05",
      expirationDate: "2024-05",
      credentialUrl: "",
    },
    {
      id: "c2",
      name: "Professional Scrum Master I",
      organization: "Scrum.org",
      issueDate: "2020-02",
      expirationDate: "",
      credentialUrl: "",
    },
  ],
  languages: [
    { id: "l1", language: "English", proficiency: "Native" },
    { id: "l2", language: "Spanish", proficiency: "Professional working" },
  ],
  templateId: "",
};
