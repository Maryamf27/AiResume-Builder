"use client";

import Input from "@/components/ui/input";
import FormField from "@/components/resume/forms/form-field";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function PersonalInfoForm() {
  const { resumeData, updatePersonal } = useResumeBuilder();
  const personal = resumeData.personal;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-charcoal">Personal Information</h2>
        <p className="mt-1 text-sm text-charcoal/60">
          How employers can identify and reach you.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="pi-first-name">
          <Input
            id="pi-first-name"
            value={personal.firstName}
            onChange={(e) => updatePersonal({ firstName: e.target.value })}
            placeholder="Amara"
            autoComplete="given-name"
          />
        </FormField>
        <FormField label="Last name" htmlFor="pi-last-name">
          <Input
            id="pi-last-name"
            value={personal.lastName}
            onChange={(e) => updatePersonal({ lastName: e.target.value })}
            placeholder="Khan"
            autoComplete="family-name"
          />
        </FormField>
      </div>

      <FormField label="Professional title" htmlFor="pi-title">
        <Input
          id="pi-title"
          value={personal.title}
          onChange={(e) => updatePersonal({ title: e.target.value })}
          placeholder="Frontend Developer"
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="pi-email" optional>
          <Input
            id="pi-email"
            type="email"
            value={personal.email}
            onChange={(e) => updatePersonal({ email: e.target.value })}
            placeholder="amara@example.com"
            autoComplete="email"
          />
        </FormField>
        <FormField label="Phone" htmlFor="pi-phone" optional>
          <Input
            id="pi-phone"
            type="tel"
            value={personal.phone}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
            placeholder="+92 300 1234567"
            autoComplete="tel"
          />
        </FormField>
      </div>

      <FormField label="Location" htmlFor="pi-location" optional>
        <Input
          id="pi-location"
          value={personal.location}
          onChange={(e) => updatePersonal({ location: e.target.value })}
          placeholder="Multan, Pakistan"
          autoComplete="address-level2"
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Website" htmlFor="pi-website" optional>
          <Input
            id="pi-website"
            type="url"
            value={personal.website}
            onChange={(e) => updatePersonal({ website: e.target.value })}
            placeholder="amara.dev"
          />
        </FormField>
        <FormField label="LinkedIn" htmlFor="pi-linkedin" optional>
          <Input
            id="pi-linkedin"
            value={personal.linkedin}
            onChange={(e) => updatePersonal({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/amara"
          />
        </FormField>
        <FormField label="GitHub" htmlFor="pi-github" optional>
          <Input
            id="pi-github"
            value={personal.github}
            onChange={(e) => updatePersonal({ github: e.target.value })}
            placeholder="github.com/amara"
          />
        </FormField>
      </div>
    </div>
  );
}
