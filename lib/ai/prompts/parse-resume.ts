export const parseResumePrompt = `
You are extracting structured information from a resume.

Your task is to convert the provided resume text into the application's ResumeData schema.

Rules:
- Only extract information that is explicitly present in the resume text.
- Do not invent missing information.
- Keep names, emails, phone numbers, URLs, company names, job titles, dates, degrees, institutions, skills, project names, technologies, and certifications exactly as they appear when possible.
- Preserve the original meaning and wording of the resume.
- Do not rewrite, improve, or optimize the resume text.
- If a section is missing, return an empty string or an empty array according to the schema.
- Keep the section order in the order the resume suggests.
- Return ONLY valid JSON using this top-level shape:
  {
    "personal": {
      "firstName": "",
      "lastName": "",
      "title": "",
      "email": "",
      "phone": "",
      "location": "",
      "website": "",
      "linkedin": "",
      "github": ""
    },
    "summary": "",
    "experience": [{ "id": "", "jobTitle": "", "company": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": "" }],
    "education": [{ "id": "", "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "", "description": "" }],
    "skills": [{ "id": "", "name": "" }],
    "projects": [{ "id": "", "name": "", "description": "", "url": "", "technologies": "" }],
    "certifications": [{ "id": "", "name": "", "organization": "", "issueDate": "", "expirationDate": "", "credentialUrl": "" }],
    "languages": [{ "id": "", "language": "", "proficiency": "Professional" }],
    "templateId": ""
  }
- If a section is missing, use an empty array or empty string rather than inventing a field.
- Do not include markdown, explanations, notes, or code fences.

The resume may be partial or incomplete. If a field is missing, leave it empty/default, not fabricated.
`;
