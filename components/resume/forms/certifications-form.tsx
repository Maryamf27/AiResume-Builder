"use client";

import { Plus } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import FormField from "@/components/resume/forms/form-field";
import EntryCard from "@/components/resume/forms/entry-card";
import EmptyState from "@/components/resume/forms/empty-state";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function CertificationsForm() {
  const { resumeData, addCertification, updateCertification, removeCertification } =
    useResumeBuilder();
  const entries = resumeData.certifications;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-charcoal">Certifications</h2>
        <p className="mt-1 text-sm text-charcoal/60">Licenses, certificates, and credentials.</p>
      </div>

      {entries.length === 0 && <EmptyState message="No certifications added yet." />}

      <div className="flex flex-col gap-4">
        {entries.map((entry, index) => (
          <EntryCard
            key={entry.id}
            title={entry.name || `Certification ${index + 1}`}
            onRemove={() => removeCertification(entry.id)}
            removeLabel="Remove certification entry"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Certification name" htmlFor={`cert-name-${entry.id}`}>
                <Input
                  id={`cert-name-${entry.id}`}
                  value={entry.name}
                  onChange={(e) => updateCertification(entry.id, { name: e.target.value })}
                  placeholder="AWS Certified Developer"
                />
              </FormField>
              <FormField label="Issuing organization" htmlFor={`cert-org-${entry.id}`}>
                <Input
                  id={`cert-org-${entry.id}`}
                  value={entry.organization}
                  onChange={(e) => updateCertification(entry.id, { organization: e.target.value })}
                  placeholder="Amazon Web Services"
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Issue date" htmlFor={`cert-issue-${entry.id}`} optional>
                <Input
                  id={`cert-issue-${entry.id}`}
                  type="month"
                  value={entry.issueDate}
                  onChange={(e) => updateCertification(entry.id, { issueDate: e.target.value })}
                />
              </FormField>
              <FormField label="Expiration date" htmlFor={`cert-expiry-${entry.id}`} optional>
                <Input
                  id={`cert-expiry-${entry.id}`}
                  type="month"
                  value={entry.expirationDate}
                  onChange={(e) => updateCertification(entry.id, { expirationDate: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Credential URL" htmlFor={`cert-url-${entry.id}`} optional>
              <Input
                id={`cert-url-${entry.id}`}
                type="url"
                value={entry.credentialUrl}
                onChange={(e) => updateCertification(entry.id, { credentialUrl: e.target.value })}
                placeholder="https://credential.example.com/verify/123"
              />
            </FormField>
          </EntryCard>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addCertification} className="self-start">
        <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
        Add certification
      </Button>
    </div>
  );
}
