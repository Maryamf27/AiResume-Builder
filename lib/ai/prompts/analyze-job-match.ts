export const analyzeJobMatchPrompt = `
Analyze one resume against one job description. Return only JSON: {"job": JobAnalysis, "match": MatchAnalysis}.

Use only supplied facts. Do not invent or rewrite resume content. Keep evidence and recommendations concise. A skill is matched only with resume evidence; identify missing and partial requirements honestly. Treat no relevant requirement as a neutral score of 100. Scores are 0-100. Status is derived by the application.

JobAnalysis fields: jobTitle, companyName, location, employmentType (string or null); experienceRequirements and educationRequirements (arrays of {requirement, importance: required|preferred|unclear}); requiredSkills and preferredSkills (arrays of {skill, category}); responsibilities, requiredQualifications, preferredQualifications, keywords, softSkills, toolsAndTechnologies, certifications (string arrays); summary (string). Include only meaningful, source-supported items.

MatchAnalysis fields: overallScore; summary; categoryScores {skills, experience, keywords, education, responsibilities, qualifications}; matchedSkills [{skill,resumeEvidence,jobRequirement}]; missingSkills [{skill,importance:high|medium|low,reason}]; partialMatches [{requirement,explanation,resumeEvidence}]; matchedKeywords and missingKeywords (string arrays); responsibilityMatches [{responsibility,matched,explanation,resumeEvidence}]; strengths [{title,explanation}]; gaps [{category,title,explanation,importance:high|medium|low}]; recommendations [{title,explanation}]. Use empty arrays when appropriate. Never suggest claiming unsupported experience or skills.

Return every field, concise JSON values only. No markdown or explanation outside the JSON object.
`;
