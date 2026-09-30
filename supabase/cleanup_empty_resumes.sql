select id, user_id, title, created_at
from public.resumes
where title = 'My Resume'
  and (data - 'templateId') = '{
    "personal": {"firstName":"","lastName":"","title":"","email":"","phone":"",
                 "location":"","website":"","linkedin":"","github":""},
    "summary": "",
    "experience": [], "education": [], "skills": [],
    "projects": [], "certifications": [], "languages": []
  }'::jsonb
order by created_at desc;

