export const analyzeJobPrompt = `
You are analyzing a job description to extract structured hiring requirements.

Your job is to extract only information that is explicitly supported by the supplied job description.

Hard rules:
- Analyze ONLY the supplied job description. Do not compare against a resume.
- Do not invent job title, employer, location, responsibilities, skills, education, qualifications, tools, certifications, or soft skills.
- If a value is not present in the text, use null for single-value fields and empty arrays for list fields.
- Distinguish clearly between required and preferred / nice-to-have requirements.
- If something is uncertain, use "unclear" for importance.
- Do not modify, rewrite, or tailor any resume or job description.
- Describe the result as a structured job analysis.
- Return valid JSON only. No markdown fences, no explanations, no notes.

Extract:
- jobTitle
- companyName
- location
- employmentType
- experienceRequirements
- educationRequirements
- requiredSkills
- preferredSkills
- responsibilities
- requiredQualifications
- preferredQualifications
- keywords
- softSkills
- toolsAndTechnologies
- certifications
- summary

Required structure:
{
  "jobTitle": "Senior Frontend Developer",
  "companyName": "Example Company",
  "location": "Lahore, Pakistan",
  "employmentType": "Full-time",
  "experienceRequirements": [
    { "requirement": "2+ years of frontend development experience", "importance": "required" }
  ],
  "educationRequirements": [
    { "requirement": "Bachelor's degree in Computer Science or related field", "importance": "preferred" }
  ],
  "requiredSkills": [
    { "skill": "React", "category": "Frameworks" },
    { "skill": "TypeScript", "category": "Programming Languages" }
  ],
  "preferredSkills": [
    { "skill": "Next.js", "category": "Frameworks" },
    { "skill": "AWS", "category": "Cloud" }
  ],
  "responsibilities": [
    "Build responsive web applications",
    "Collaborate with cross-functional teams"
  ],
  "requiredQualifications": [
    "2+ years experience in frontend development"
  ],
  "preferredQualifications": [
    "Experience with SaaS products"
  ],
  "keywords": ["React", "TypeScript", "Next.js", "REST API", "Git"],
  "softSkills": ["Communication", "Teamwork", "Problem solving"],
  "toolsAndTechnologies": ["React", "TypeScript", "Git", "Docker"],
  "certifications": ["AWS Certified Developer"],
  "summary": "A frontend developer role focused on building and improving modern web applications with React and TypeScript."
}

Rules for each list item:
- Each requirement item must include the actual requirement text and importance.
- Each skill item must include the skill and a category.
- Keep list items concise and grounded in the source text.
- Prefer job-relevant keywords and tools actually named in the description.
- Return only meaningful skills and keywords; avoid filler.
- Do not include generic terms like 'team player' unless explicitly mentioned in the job description.
- If the job description does not mention a category, use only the categories that are supported.

Output requirements:
- jobTitle: string or null
- companyName: string or null
- location: string or null
- employmentType: string or null
- experienceRequirements: array of objects with { requirement, importance }
- educationRequirements: array of objects with { requirement, importance }
- requiredSkills: array of objects with { skill, category }
- preferredSkills: array of objects with { skill, category }
- responsibilities: array of strings
- requiredQualifications: array of strings
- preferredQualifications: array of strings
- keywords: array of strings
- softSkills: array of strings
- toolsAndTechnologies: array of strings
- certifications: array of strings
- summary: string

Return only the JSON object described above.
`;
