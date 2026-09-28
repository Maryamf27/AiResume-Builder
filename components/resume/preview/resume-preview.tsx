"use client";

import type { ReactNode } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Link,
  Code2,
  type LucideIcon,
} from "lucide-react";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function ResumePreview() {
  const { resumeData } = useResumeBuilder();
  const { personal, summary, experience, education, skills, projects, certifications, languages } =
    resumeData;

  const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(" ");
  const hasAnyContent =
    fullName ||
    personal.title ||
    summary ||
    experience.length > 0 ||
    education.length > 0 ||
    skills.length > 0 ||
    projects.length > 0 ||
    certifications.length > 0 ||
    languages.length > 0;

  return (
    <div className="mx-auto w-full max-w-180">
      <div
        className="aspect-[1/1.414] w-full rounded-sm border border-cream-dark bg-white p-8 shadow-sm sm:p-12"
        aria-label="Resume preview"
      >
        {!hasAnyContent ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="font-serif text-lg text-charcoal/50">Your resume will appear here</p>
            <p className="max-w-[28ch] text-sm text-charcoal/40">
              Start with your personal information and it will show up live on this page.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-charcoal">
            <header>
              {fullName && <h1 className="font-serif text-3xl">{fullName}</h1>}
              {personal.title && <p className="mt-1 text-base text-olive-dark">{personal.title}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/60">
                {personal.email && <ContactItem icon={Mail}>{personal.email}</ContactItem>}
                {personal.phone && <ContactItem icon={Phone}>{personal.phone}</ContactItem>}
                {personal.location && <ContactItem icon={MapPin}>{personal.location}</ContactItem>}
                {personal.website && <ContactItem icon={Globe}>{personal.website}</ContactItem>}
                {personal.linkedin && <ContactItem icon={Link}>{personal.linkedin}</ContactItem>}
                {personal.github && <ContactItem icon={Code2}>{personal.github}</ContactItem>}
              </div>
            </header>

            {summary && (
              <PreviewSection title="Summary">
                <p className="text-sm leading-6 text-charcoal/80">{summary}</p>
              </PreviewSection>
            )}

            {experience.length > 0 && (
              <PreviewSection title="Experience">
                <div className="flex flex-col gap-4">
                  {experience.map((entry) => (
                    <div key={entry.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="text-sm font-medium">
                          {entry.jobTitle || "Untitled role"}
                          {entry.company ? ` · ${entry.company}` : ""}
                        </p>
                        <p className="text-xs text-charcoal/50">
                          {formatRange(entry.startDate, entry.current ? "Present" : entry.endDate)}
                        </p>
                      </div>
                      {entry.location && <p className="text-xs text-charcoal/50">{entry.location}</p>}
                      {entry.description && (
                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-charcoal/75">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </PreviewSection>
            )}

            {education.length > 0 && (
              <PreviewSection title="Education">
                <div className="flex flex-col gap-4">
                  {education.map((entry) => (
                    <div key={entry.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="text-sm font-medium">
                          {entry.degree || "Degree"}
                          {entry.institution ? ` · ${entry.institution}` : ""}
                        </p>
                        <p className="text-xs text-charcoal/50">
                          {formatRange(entry.startDate, entry.endDate)}
                        </p>
                      </div>
                      {entry.fieldOfStudy && (
                        <p className="text-xs text-charcoal/50">{entry.fieldOfStudy}</p>
                      )}
                      {entry.description && (
                        <p className="mt-1 text-sm leading-6 text-charcoal/75">{entry.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </PreviewSection>
            )}

            {skills.length > 0 && (
              <PreviewSection title="Skills">
                <p className="text-sm leading-6 text-charcoal/80">
                  {skills.map((skill) => skill.name).join(" · ")}
                </p>
              </PreviewSection>
            )}

            {projects.length > 0 && (
              <PreviewSection title="Projects">
                <div className="flex flex-col gap-4">
                  {projects.map((entry) => (
                    <div key={entry.id}>
                      <p className="text-sm font-medium">{entry.name || "Untitled project"}</p>
                      {entry.description && (
                        <p className="mt-1 text-sm leading-6 text-charcoal/75">{entry.description}</p>
                      )}
                      {entry.technologies && (
                        <p className="mt-1 text-xs text-charcoal/50">{entry.technologies}</p>
                      )}
                    </div>
                  ))}
                </div>
              </PreviewSection>
            )}

            {certifications.length > 0 && (
              <PreviewSection title="Certifications">
                <div className="flex flex-col gap-2">
                  {certifications.map((entry) => (
                    <div key={entry.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="text-sm font-medium">
                        {entry.name || "Untitled certification"}
                        {entry.organization ? ` · ${entry.organization}` : ""}
                      </p>
                      {entry.issueDate && <p className="text-xs text-charcoal/50">{entry.issueDate}</p>}
                    </div>
                  ))}
                </div>
              </PreviewSection>
            )}

            {languages.length > 0 && (
              <PreviewSection title="Languages">
                <p className="text-sm leading-6 text-charcoal/80">
                  {languages.map((entry) => `${entry.language || "—"} (${entry.proficiency})`).join(" · ")}
                </p>
              </PreviewSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="border-b border-charcoal/15 pb-1 text-xs font-semibold uppercase tracking-wide text-olive-dark">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function ContactItem({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1">
      <Icon className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>
  );
}

function formatRange(start: string, end: string): string {
  if (!start && !end) return "";
  if (!end) return start;
  if (!start) return end;
  return `${start} – ${end}`;
}