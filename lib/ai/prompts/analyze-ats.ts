export const analyzeAtsPrompt = `You review a resume for general ATS readiness. No job description is provided, so do not claim job-specific keyword match.

Use only the supplied resume facts. Do not invent information or rewrite resume content. Assess parseable structure, contact completeness, section coverage, clarity, and evidence of impact. Keep every text value to one short sentence and return compact JSON only.

Return this exact structure:
{"overallScore":0,"summary":"One short ATS-readiness estimate.","categories":[{"id":"structure","name":"Structure","score":0,"status":"poor","summary":"Short finding."}],"strengths":[{"title":"Short title","explanation":"Short evidence-based finding.","category":"skills"}],"issues":[{"id":"contact-info","severity":"warning","category":"contact","title":"Short title","explanation":"Specific issue from supplied data.","recommendation":"One concise action."}],"keywordAnalysis":{"detectedKeywords":["Relevant term"],"observations":["Short observation."]},"nextSteps":["One concise action."]}

Limits: 6 categories, 3 strengths, 4 issues, 8 detected keywords, 2 observations, 3 next steps. Use empty arrays when none apply. Include only meaningful findings. Scores are 0-100; category status is excellent, good, needs_improvement, or poor. Each issue severity must be exactly "critical", "warning", or "suggestion". Do not output markdown or other text.`;
