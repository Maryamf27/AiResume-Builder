
insert into public.templates
  (id, slug, name, description, category, sort_order, is_published, html, css)
values
  ('7e3a9c10-2b5d-4f6a-9d01-000000000001', 'classic', 'Classic', 'A traditional, centred layout in a conservative serif. Clear hierarchy that suits almost any profession.', 'Traditional', 10, true,
   $tpl$<div class="page">
  <header>
    <h1>{{fullName}}</h1>
    {{#title}}<p class="role">{{title}}</p>{{/title}}
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>Professional Summary</h2>
    <p>{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Experience</h2>
    {{#experience}}
    <div class="entry">
      <div class="row"><h3>{{jobTitle}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
  </section>
  {{/hasExperience}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    {{#education}}
    <div class="entry">
      <div class="row"><h3><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub">{{institution}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
  </section>
  {{/hasEducation}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Skills</h2>
    <p>{{skillsList}}</p>
  </section>
  {{/hasSkills}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Projects</h2>
    {{#projects}}
    <div class="entry">
      <div class="row"><h3>{{name}}</h3>{{#href}}<a class="url" href="{{href}}">{{url}}</a>{{/href}}</div>
      {{#technologies}}<div class="sub">{{technologies}}</div>{{/technologies}}
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications</h2>
    {{#certifications}}
    <div class="row cert"><span>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}</span><span class="dates">{{issueDate}}</span></div>
    {{/certifications}}
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <ul class="inline">{{#languages}}<li>{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</li>{{/languages}}</ul>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 14mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Georgia, "Times New Roman", Times, serif; color: #1a1a1a; font-size: 13.5px; line-height: 1.45; }
@media print { body { min-height: 0; } }
.page { padding: 0 56px; }
@media screen { .page { padding-top: 56px; padding-bottom: 56px; } }

header { text-align: center; padding-bottom: 14px; border-bottom: 2px solid #1a1a1a; }
h1 { margin: 0; font-size: 32px; line-height: 1.15; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; overflow-wrap: anywhere; }
.role { margin: 6px 0 0; font-size: 15px; font-style: italic; color: #444; }
.contacts { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 20px; font-size: 12.5px; color: #333; }
.contacts li { overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }

.sec { margin-top: 20px; }
h2 { margin: 0 0 10px; padding-bottom: 3px; border-bottom: 1px solid #9a9a9a; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; break-after: avoid; }
p { margin: 0; overflow-wrap: anywhere; }

.entry { margin-bottom: 12px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h3 { margin: 0; min-width: 0; font-size: 14px; font-weight: 700; overflow-wrap: anywhere; break-after: avoid; }
.dates { flex: none; font-size: 12.5px; font-style: italic; color: #444; white-space: nowrap; }
.url { flex: none; max-width: 55%; font-size: 12.5px; font-style: italic; color: #444; overflow-wrap: anywhere; }
.sub { font-style: italic; color: #333; overflow-wrap: anywhere; }
.sub:empty { display: none; }
.loc::before { content: " · "; }
.co:empty + .loc::before { content: ""; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
ul { margin: 5px 0 0; padding-left: 20px; }
ul:empty { display: none; }
li { margin: 2px 0; overflow-wrap: anywhere; }
.cert { margin-bottom: 4px; }
.org::before { content: " — "; }
ul.inline { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; }
ul.inline li { margin: 0; }
ul.inline li + li::before { content: "·"; margin: 0 10px; color: #777; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000002', 'modern', 'Modern', 'A clean, contemporary sans-serif page with a teal accent, timeline-style experience and skill tags.', 'Modern', 20, true,
   $tpl$<div class="page">
  <header>
    <h1>{{fullName}}</h1>
    {{#title}}<p class="role">{{title}}</p>{{/title}}
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>Profile</h2>
    <p class="summary">{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Experience</h2>
    <div class="timeline">
    {{#experience}}
    <div class="entry">
      <div class="row"><h3>{{jobTitle}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
    </div>
  </section>
  {{/hasExperience}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Projects</h2>
    {{#projects}}
    <div class="entry plain">
      <div class="row"><h3>{{name}}</h3>{{#href}}<a class="url" href="{{href}}">{{url}}</a>{{/href}}</div>
      {{#technologies}}<div class="sub">{{technologies}}</div>{{/technologies}}
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    <div class="timeline">
    {{#education}}
    <div class="entry">
      <div class="row"><h3><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub">{{institution}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
    </div>
  </section>
  {{/hasEducation}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Skills</h2>
    <ul class="chips">{{#skills}}<li>{{name}}</li>{{/skills}}</ul>
  </section>
  {{/hasSkills}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications</h2>
    {{#certifications}}
    <div class="row cert"><span>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}</span><span class="dates">{{issueDate}}</span></div>
    {{/certifications}}
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <ul class="inline">{{#languages}}<li>{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</li>{{/languages}}</ul>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 14mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif; color: #1f2933; font-size: 13px; line-height: 1.5; }
@media print { body { min-height: 0; } }
.page { padding: 0 52px; }
@media screen { .page { padding-top: 52px; padding-bottom: 52px; } }

header { padding: 0 0 18px 18px; border-left: 6px solid #2b6178; }
h1 { margin: 0; font-size: 36px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; color: #17394a; overflow-wrap: anywhere; }
.role { margin: 6px 0 0; font-size: 16px; font-weight: 500; color: #2b6178; }
.contacts { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 3px 18px; font-size: 12px; color: #52606d; }
.contacts li { overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }

.sec { margin-top: 22px; }
h2 { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #2b6178; break-after: avoid; }
h2::after { content: ""; flex: 1; height: 1px; background: #d3dde4; }
p { margin: 0; overflow-wrap: anywhere; }
.summary { color: #323f4b; }

.entry { margin-bottom: 14px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
.timeline .entry { position: relative; padding-left: 18px; border-left: 2px solid #d3dde4; }
.timeline .entry::before { content: ""; position: absolute; left: -6px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: #fff; border: 2px solid #2b6178; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h3 { margin: 0; min-width: 0; font-size: 14px; font-weight: 700; color: #17394a; overflow-wrap: anywhere; break-after: avoid; }
.dates { flex: none; font-size: 12px; color: #616e7c; white-space: nowrap; }
.url { flex: none; max-width: 55%; font-size: 12px; color: #2b6178; overflow-wrap: anywhere; }
.sub { color: #2b6178; font-weight: 500; overflow-wrap: anywhere; }
.sub:empty { display: none; }
.loc { color: #616e7c; font-weight: 400; }
.loc::before { content: " · "; }
.co:empty + .loc::before { content: ""; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
ul { margin: 5px 0 0; padding-left: 18px; }
ul:empty { display: none; }
li { margin: 2px 0; overflow-wrap: anywhere; }
li::marker { color: #2b6178; }
.chips { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; }
.chips li { margin: 0; padding: 3px 10px; background: #e8f0f4; border-radius: 3px; font-size: 12px; color: #17394a; }
.cert { margin-bottom: 4px; }
.org::before { content: " — "; color: #616e7c; }
.org { color: #616e7c; }
ul.inline { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 2px 20px; }
ul.inline li { margin: 0; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000003', 'minimal', 'Minimal', 'Generous whitespace and quiet section labels in the margin. No rules, no decoration, the writing leads.', 'Minimal', 30, true,
   $tpl$<div class="page">
  <header>
    <h1>{{fullName}}</h1>
    {{#title}}<p class="role">{{title}}</p>{{/title}}
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>About</h2>
    <div class="body"><p>{{summary}}</p></div>
  </section>
  {{/hasSummary}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Experience</h2>
    <div class="body">
    {{#experience}}
    <div class="entry">
      <div class="row"><h3>{{jobTitle}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
    </div>
  </section>
  {{/hasExperience}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    <div class="body">
    {{#education}}
    <div class="entry">
      <div class="row"><h3><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub">{{institution}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
    </div>
  </section>
  {{/hasEducation}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Projects</h2>
    <div class="body">
    {{#projects}}
    <div class="entry">
      <div class="row"><h3>{{name}}</h3>{{#href}}<a class="url" href="{{href}}">{{url}}</a>{{/href}}</div>
      {{#technologies}}<div class="sub">{{technologies}}</div>{{/technologies}}
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
    </div>
  </section>
  {{/hasProjects}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Skills</h2>
    <div class="body"><p>{{skillsList}}</p></div>
  </section>
  {{/hasSkills}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications</h2>
    <div class="body">
    {{#certifications}}
    <div class="row cert"><span>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}</span><span class="dates">{{issueDate}}</span></div>
    {{/certifications}}
    </div>
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <div class="body"><p>{{#languages}}<span class="lang">{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</span>{{/languages}}</p></div>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 16mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif; color: #222; font-size: 13px; line-height: 1.6; }
@media print { body { min-height: 0; } }
.page { padding: 0 60px; }
@media screen { .page { padding-top: 60px; padding-bottom: 60px; } }

header { margin-bottom: 8px; }
h1 { margin: 0; font-size: 40px; line-height: 1.1; font-weight: 300; letter-spacing: -0.02em; overflow-wrap: anywhere; }
.role { margin: 8px 0 0; font-size: 15px; color: #777; }
.contacts { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 2px 22px; font-size: 12px; color: #666; }
.contacts li { overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }

.sec { display: flex; align-items: flex-start; margin-top: 30px; }
h2 { flex: none; width: 138px; margin: 3px 0 0; padding-right: 12px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #8c8c8c; }
.body { flex: 1; min-width: 0; }
p { margin: 0; overflow-wrap: anywhere; }
.lang { margin-right: 18px; }

.entry { margin-bottom: 16px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h3 { margin: 0; min-width: 0; font-size: 13.5px; font-weight: 600; overflow-wrap: anywhere; break-after: avoid; }
.dates { flex: none; font-size: 11.5px; color: #8c8c8c; white-space: nowrap; }
.url { flex: none; max-width: 55%; font-size: 11.5px; color: #8c8c8c; overflow-wrap: anywhere; }
.sub { color: #555; overflow-wrap: anywhere; }
.sub:empty { display: none; }
.loc::before { content: " · "; }
.co:empty + .loc::before { content: ""; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
.entry ul { margin: 6px 0 0; padding: 0; list-style: none; }
.entry ul:empty { display: none; }
.entry li { margin: 3px 0; padding-left: 14px; position: relative; overflow-wrap: anywhere; color: #333; }
.entry li::before { content: "–"; position: absolute; left: 0; color: #aaa; }
.cert { margin-bottom: 5px; }
.org::before { content: " · "; }
.org { color: #777; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000004', 'executive', 'Executive', 'A formal navy header with gold detailing, an executive profile and a core competencies grid for senior roles.', 'Professional', 40, true,
   $tpl$<div class="page">
  <header>
    <h1>{{fullName}}</h1>
    {{#title}}<p class="role">{{title}}</p>{{/title}}
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>Executive Profile</h2>
    <p class="summary">{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Core Competencies</h2>
    <ul class="grid">{{#skills}}<li>{{name}}</li>{{/skills}}</ul>
  </section>
  {{/hasSkills}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Professional Experience</h2>
    {{#experience}}
    <div class="entry">
      <div class="row"><h3>{{jobTitle}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}</div>
      {{#description}}<ul class="bul">{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
  </section>
  {{/hasExperience}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Selected Projects</h2>
    {{#projects}}
    <div class="entry">
      <div class="row"><h3>{{name}}</h3>{{#href}}<a class="url" href="{{href}}">{{url}}</a>{{/href}}</div>
      {{#technologies}}<div class="sub">{{technologies}}</div>{{/technologies}}
      {{#description}}<ul class="bul">{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    {{#education}}
    <div class="entry">
      <div class="row"><h3><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub">{{institution}}</div>
      {{#description}}<ul class="bul">{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
  </section>
  {{/hasEducation}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications</h2>
    {{#certifications}}
    <div class="row cert"><span>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}</span><span class="dates">{{issueDate}}</span></div>
    {{/certifications}}
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <ul class="inline">{{#languages}}<li>{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</li>{{/languages}}</ul>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 14mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Liberation Serif", serif; color: #1c2430; font-size: 13.5px; line-height: 1.5; }
@media print { body { min-height: 0; } }
.page { padding: 0 40px; }
@media screen { .page { padding-top: 40px; padding-bottom: 44px; } }

header { padding: 28px 34px 24px; background: #1b2a41; color: #fff; border-bottom: 4px solid #a3813a; }
h1 { margin: 0; font-size: 34px; line-height: 1.15; font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; overflow-wrap: anywhere; }
.role { margin: 10px 0 0; font-size: 12.5px; letter-spacing: 0.22em; text-transform: uppercase; color: #d9c48d; }
.contacts { list-style: none; margin: 16px 0 0; padding: 14px 0 0; border-top: 1px solid rgba(255, 255, 255, 0.25); display: flex; flex-wrap: wrap; gap: 3px 22px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11.5px; color: #e4e9f0; }
.contacts li { overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }

.sec { margin-top: 22px; padding: 0 6px; }
h2 { margin: 0 0 10px; padding-bottom: 5px; border-bottom: 1px solid #a3813a; font-size: 12.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #1b2a41; break-after: avoid; }
p { margin: 0; overflow-wrap: anywhere; }
.summary { font-size: 14px; line-height: 1.6; }

.entry { margin-bottom: 14px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h3 { margin: 0; min-width: 0; font-size: 13.5px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: #1b2a41; overflow-wrap: anywhere; break-after: avoid; }
.dates { flex: none; font-size: 12.5px; color: #7a6230; font-weight: 700; white-space: nowrap; }
.url { flex: none; max-width: 55%; font-size: 12px; color: #7a6230; overflow-wrap: anywhere; }
.sub { font-style: italic; color: #3b4656; overflow-wrap: anywhere; }
.sub:empty { display: none; }
.loc::before { content: " · "; }
.co:empty + .loc::before { content: ""; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
ul.bul { margin: 6px 0 0; padding-left: 18px; }
ul.bul:empty { display: none; }
ul.bul li { margin: 2px 0; overflow-wrap: anywhere; }
ul.bul li::marker { color: #a3813a; }
ul.grid { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; }
ul.grid li { flex: 0 0 33.333%; padding: 2px 10px 2px 0; overflow-wrap: anywhere; }
ul.grid li::before { content: ""; display: inline-block; width: 5px; height: 5px; margin-right: 9px; background: #a3813a; vertical-align: middle; }
.cert { margin-bottom: 4px; }
.org::before { content: " — "; }
.org { color: #3b4656; }
ul.inline { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 2px 24px; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000005', 'creative', 'Creative', 'An expressive split-weight name, terracotta accent and label tabs. Distinctive, yet plain text throughout.', 'Creative', 50, true,
   $tpl$<div class="page">
  <header>
    <div class="ident">
      <h1><span class="fn">{{firstName}}</span> <span class="ln">{{lastName}}</span></h1>
      {{#title}}<p class="role">{{title}}</p>{{/title}}
    </div>
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>Profile</h2>
    <p class="summary">{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Experience</h2>
    {{#experience}}
    <div class="entry">
      <div class="row"><h3>{{jobTitle}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
  </section>
  {{/hasExperience}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Projects</h2>
    {{#projects}}
    <div class="entry">
      <div class="row"><h3>{{name}}</h3>{{#href}}<a class="url" href="{{href}}">{{url}}</a>{{/href}}</div>
      {{#technologies}}<div class="sub">{{technologies}}</div>{{/technologies}}
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Skills</h2>
    <ul class="tags">{{#skills}}<li>{{name}}</li>{{/skills}}</ul>
  </section>
  {{/hasSkills}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    {{#education}}
    <div class="entry">
      <div class="row"><h3><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub">{{institution}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
  </section>
  {{/hasEducation}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications</h2>
    {{#certifications}}
    <div class="row cert"><span>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}</span><span class="dates">{{issueDate}}</span></div>
    {{/certifications}}
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <ul class="inline">{{#languages}}<li>{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</li>{{/languages}}</ul>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 14mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Trebuchet MS", "Gill Sans", "Segoe UI", Helvetica, Arial, sans-serif; color: #262626; font-size: 13px; line-height: 1.5; }
@media print { body { min-height: 0; } }
.page { padding: 0 52px; }
@media screen { .page { padding-top: 48px; padding-bottom: 48px; } }

header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; padding-bottom: 20px; border-bottom: 6px solid #c0452b; }
.ident { min-width: 0; }
h1 { margin: 0; font-size: 46px; line-height: 1; letter-spacing: -0.02em; color: #262626; overflow-wrap: anywhere; }
.fn, .ln { display: block; }
.fn { font-weight: 300; }
.ln { font-weight: 800; color: #c0452b; }
.role { margin: 12px 0 0; font-size: 12.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #555; }
.contacts { flex: none; max-width: 240px; list-style: none; margin: 0; padding: 0; text-align: right; font-size: 12px; color: #444; }
.contacts li { margin: 2px 0; overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }

.sec { margin-top: 22px; }
h2 { display: inline-block; margin: 0 0 12px; padding: 4px 12px; background: #262626; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; break-after: avoid; }
p { margin: 0; overflow-wrap: anywhere; }
.summary { font-family: Georgia, "Times New Roman", serif; font-size: 15px; line-height: 1.55; color: #333; }

.entry { margin-bottom: 14px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h3 { margin: 0; min-width: 0; font-size: 15px; font-weight: 700; overflow-wrap: anywhere; break-after: avoid; }
.dates { flex: none; font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #c0452b; white-space: nowrap; }
.url { flex: none; max-width: 55%; font-size: 12px; color: #c0452b; overflow-wrap: anywhere; }
.sub { font-weight: 700; color: #c0452b; overflow-wrap: anywhere; }
.sub:empty { display: none; }
.loc { font-weight: 400; color: #666; }
.loc::before { content: " / "; }
.co:empty + .loc::before { content: ""; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
ul { margin: 6px 0 0; padding-left: 18px; }
ul:empty { display: none; }
li { margin: 2px 0; overflow-wrap: anywhere; }
li::marker { color: #c0452b; }
ul.tags { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; }
ul.tags li { margin: 0; padding: 2px 10px; border: 1.5px solid #262626; font-size: 12px; font-weight: 600; }
ul.tags li::marker { content: ""; }
.cert { margin-bottom: 4px; }
.org::before { content: " / "; color: #999; }
.org { color: #666; }
ul.inline { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 2px 22px; }
ul.inline li { margin: 0; }
ul.inline li::marker { content: ""; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000006', 'academic', 'Academic', 'A CV-style layout that leads with education, for students, graduates, researchers and academic profiles.', 'Academic', 60, true,
   $tpl$<div class="page">
  <header>
    <div class="ident">
      <h1>{{fullName}}</h1>
      {{#title}}<p class="role">{{title}}</p>{{/title}}
    </div>
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>Profile</h2>
    <p>{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    {{#education}}
    <div class="entry">
      <div class="row"><h3>{{institution}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub"><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
  </section>
  {{/hasEducation}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Professional and Research Experience</h2>
    {{#experience}}
    <div class="entry">
      <div class="row"><h3>{{jobTitle}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
  </section>
  {{/hasExperience}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Research and Projects</h2>
    {{#projects}}
    <div class="entry">
      <div class="row"><h3>{{name}}</h3>{{#href}}<a class="url" href="{{href}}">{{url}}</a>{{/href}}</div>
      {{#technologies}}<div class="sub">{{technologies}}</div>{{/technologies}}
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications and Awards</h2>
    {{#certifications}}
    <div class="row cert"><span>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}</span><span class="dates">{{issueDate}}</span></div>
    {{/certifications}}
  </section>
  {{/hasCertifications}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Skills and Techniques</h2>
    <p>{{skillsList}}</p>
  </section>
  {{/hasSkills}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <ul class="inline">{{#languages}}<li>{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</li>{{/languages}}</ul>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 15mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Times New Roman", Times, "Liberation Serif", serif; color: #000; font-size: 14px; line-height: 1.4; }
@media print { body { min-height: 0; } }
.page { padding: 0 58px; }
@media screen { .page { padding-top: 54px; padding-bottom: 54px; } }

header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; padding-bottom: 12px; border-bottom: 2px solid #000; }
.ident { min-width: 0; }
h1 { margin: 0; font-size: 28px; line-height: 1.15; font-weight: 700; font-variant: small-caps; letter-spacing: 0.04em; overflow-wrap: anywhere; }
.role { margin: 4px 0 0; font-size: 15px; font-style: italic; }
.contacts { flex: none; max-width: 250px; list-style: none; margin: 0; padding: 0; text-align: right; font-size: 12.5px; line-height: 1.45; }
.contacts li { overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }

.sec { margin-top: 18px; }
h2 { margin: 0 0 8px; padding-bottom: 2px; border-bottom: 1px solid #000; font-size: 14.5px; font-weight: 700; font-variant: small-caps; letter-spacing: 0.06em; break-after: avoid; }
p { margin: 0; overflow-wrap: anywhere; }

.entry { margin-bottom: 10px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h3 { margin: 0; min-width: 0; font-size: 14px; font-weight: 700; overflow-wrap: anywhere; break-after: avoid; }
.dates { flex: none; font-size: 13px; white-space: nowrap; }
.url { flex: none; max-width: 55%; font-size: 12.5px; font-style: italic; overflow-wrap: anywhere; }
.sub { font-style: italic; overflow-wrap: anywhere; }
.sub:empty { display: none; }
.loc::before { content: ", "; }
.co:empty + .loc::before { content: ""; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
ul { margin: 4px 0 0; padding-left: 22px; }
ul:empty { display: none; }
li { margin: 2px 0; overflow-wrap: anywhere; }
.cert { margin-bottom: 3px; }
.org::before { content: ", "; }
.org { font-style: italic; }
ul.inline { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 2px 26px; }
ul.inline li { margin: 0; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000007', 'compact', 'Compact', 'A dense, efficient layout with one-line entries that fits substantial experience on fewer pages.', 'Compact', 70, true,
   $tpl$<div class="page">
  <header>
    <div class="top"><h1>{{fullName}}</h1>{{#title}}<p class="role">{{title}}</p>{{/title}}</div>
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>Summary</h2>
    <p>{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Skills</h2>
    <p>{{skillsList}}</p>
  </section>
  {{/hasSkills}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Experience</h2>
    {{#experience}}
    <div class="entry">
      <div class="row"><h3><span class="t">{{jobTitle}}</span><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}</h3><span class="dates">{{dateRange}}</span></div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
  </section>
  {{/hasExperience}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Projects</h2>
    {{#projects}}
    <div class="entry">
      <div class="row"><h3><span class="t">{{name}}</span>{{#technologies}}<span class="co">{{technologies}}</span>{{/technologies}}</h3>{{#href}}<a class="url" href="{{href}}">{{url}}</a>{{/href}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    {{#education}}
    <div class="entry">
      <div class="row"><h3><span class="t"><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</span><span class="co">{{institution}}</span></h3><span class="dates">{{dateRange}}</span></div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
  </section>
  {{/hasEducation}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications</h2>
    {{#certifications}}
    <div class="row cert"><span>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}</span><span class="dates">{{issueDate}}</span></div>
    {{/certifications}}
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <ul class="inline">{{#languages}}<li>{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</li>{{/languages}}</ul>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 11mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Arial, Helvetica, "Liberation Sans", sans-serif; color: #111; font-size: 12.5px; line-height: 1.38; }
@media print { body { min-height: 0; } }
.page { padding: 0 40px; }
@media screen { .page { padding-top: 40px; padding-bottom: 40px; } }

header { padding-bottom: 8px; border-bottom: 2px solid #111; }
.top { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h1 { margin: 0; min-width: 0; font-size: 26px; line-height: 1.15; font-weight: 700; letter-spacing: -0.01em; overflow-wrap: anywhere; }
.role { margin: 0; text-align: right; font-size: 14px; font-weight: 600; color: #444; }
.contacts { list-style: none; margin: 5px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 1px 16px; font-size: 11.5px; color: #333; }
.contacts li { overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }

.sec { margin-top: 11px; }
h2 { margin: 0 0 5px; padding: 2px 8px; background: #e9edf0; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; break-after: avoid; }
p { margin: 0; overflow-wrap: anywhere; }

.entry { margin-bottom: 7px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
h3 { margin: 0; min-width: 0; font-size: 12.5px; font-weight: 400; overflow-wrap: anywhere; break-after: avoid; }
.t { font-weight: 700; }
.co::before { content: " — "; }
.t:empty + .co::before { content: ""; }
.co { color: #333; }
.loc { color: #555; }
.loc::before { content: ", "; }
.co:empty + .loc::before { content: ""; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
.dates { flex: none; font-size: 11.5px; color: #444; white-space: nowrap; }
.url { flex: none; max-width: 50%; font-size: 11.5px; color: #444; overflow-wrap: anywhere; }
ul { margin: 2px 0 0; padding-left: 16px; }
ul:empty { display: none; }
li { margin: 1px 0; overflow-wrap: anywhere; }
.cert { margin-bottom: 2px; }
.org::before { content: " — "; }
.org { color: #333; }
ul.inline { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 1px 20px; }
ul.inline li { margin: 0; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000008', 'elegant', 'Elegant', 'Refined serif typography, small caps and subtle hairline details, with a centred, balanced composition.', 'Elegant', 80, true,
   $tpl$<div class="page">
  <header>
    <h1>{{fullName}}</h1>
    {{#title}}<p class="role">{{title}}</p>{{/title}}
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>Profile</h2>
    <p class="summary">{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Experience</h2>
    {{#experience}}
    <div class="entry">
      <div class="row"><h3>{{jobTitle}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
  </section>
  {{/hasExperience}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    {{#education}}
    <div class="entry">
      <div class="row"><h3><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</h3><span class="dates">{{dateRange}}</span></div>
      <div class="sub">{{institution}}</div>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
  </section>
  {{/hasEducation}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Projects</h2>
    {{#projects}}
    <div class="entry">
      <div class="row"><h3>{{name}}</h3>{{#href}}<a class="url" href="{{href}}">{{url}}</a>{{/href}}</div>
      {{#technologies}}<div class="sub">{{technologies}}</div>{{/technologies}}
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Skills</h2>
    <ul class="center">{{#skills}}<li>{{name}}</li>{{/skills}}</ul>
  </section>
  {{/hasSkills}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications</h2>
    {{#certifications}}
    <div class="row cert"><span>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}</span><span class="dates">{{issueDate}}</span></div>
    {{/certifications}}
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <ul class="center">{{#languages}}<li>{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</li>{{/languages}}</ul>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 15mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Garamond, "EB Garamond", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, "Liberation Serif", serif; color: #33302b; font-size: 14px; line-height: 1.5; }
@media print { body { min-height: 0; } }
.page { padding: 0 62px; }
@media screen { .page { padding-top: 54px; padding-bottom: 54px; } }

header { text-align: center; padding-bottom: 6px; }
h1 { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 400; font-variant: small-caps; letter-spacing: 0.1em; color: #2a2723; overflow-wrap: anywhere; }
.role { margin: 6px 0 0; font-size: 16px; font-style: italic; color: #8a6f4d; }
.contacts { list-style: none; margin: 14px 0 0; padding: 12px 0 0; border-top: 1px solid #d9cfbf; display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 22px; font-size: 12.5px; letter-spacing: 0.03em; color: #5b554c; }
.contacts li { overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }

.sec { margin-top: 22px; }
h2 { display: flex; align-items: center; gap: 16px; margin: 0 0 12px; font-size: 12.5px; font-weight: 400; letter-spacing: 0.24em; text-transform: uppercase; color: #8a6f4d; break-after: avoid; }
h2::before, h2::after { content: ""; flex: 1; height: 1px; background: #ddd3c3; }
p { margin: 0; overflow-wrap: anywhere; }
.summary { text-align: center; font-style: italic; font-size: 15px; line-height: 1.6; }

.entry { margin-bottom: 14px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
h3 { margin: 0; min-width: 0; font-size: 15px; font-weight: 700; color: #2a2723; overflow-wrap: anywhere; break-after: avoid; }
.dates { flex: none; font-size: 13px; font-variant: small-caps; letter-spacing: 0.06em; color: #6f6759; white-space: nowrap; }
.url { flex: none; max-width: 55%; font-size: 13px; font-style: italic; color: #8a6f4d; overflow-wrap: anywhere; }
.sub { font-style: italic; color: #6f6759; overflow-wrap: anywhere; }
.sub:empty { display: none; }
.loc::before { content: " · "; }
.co:empty + .loc::before { content: ""; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
ul { margin: 5px 0 0; padding-left: 20px; }
ul:empty { display: none; }
li { margin: 2px 0; overflow-wrap: anywhere; }
li::marker { color: #b7a684; }
.cert { margin-bottom: 4px; }
.org::before { content: " — "; color: #b7a684; }
.org { font-style: italic; color: #6f6759; }
ul.center { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 0; }
ul.center li { margin: 0; }
ul.center li + li::before { content: "◆"; margin: 0 12px; font-size: 7px; vertical-align: middle; color: #b7a684; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000009', 'professional-two-column', 'Professional Two-Column', 'A sidebar for contact details, skills, education and languages, beside a main column for experience.', 'Two-column', 90, true,
   $tpl$<div class="page">
  <header>
    <h1>{{fullName}}</h1>
    {{#title}}<p class="role">{{title}}</p>{{/title}}
  </header>

  <div class="cols">
    <aside class="side">
      {{#hasContacts}}
      <section class="sec">
        <h2>Contact</h2>
        <ul class="plain">
          {{#contacts}}<li>{{#href}}<a href="{{href}}">{{value}}</a>{{/href}}{{^href}}{{value}}{{/href}}</li>{{/contacts}}
        </ul>
      </section>
      {{/hasContacts}}

      {{#hasSkills}}
      <section class="sec">
        <h2>Skills</h2>
        <ul class="plain">{{#skills}}<li>{{name}}</li>{{/skills}}</ul>
      </section>
      {{/hasSkills}}

      {{#hasEducation}}
      <section class="sec">
        <h2>Education</h2>
        {{#education}}
        <div class="entry">
          <h3><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</h3>
          <div class="sub">{{institution}}</div>
          <div class="dates">{{dateRange}}</div>
        </div>
        {{/education}}
      </section>
      {{/hasEducation}}

      {{#hasCertifications}}
      <section class="sec">
        <h2>Certifications</h2>
        {{#certifications}}
        <div class="entry">
          <h3>{{name}}</h3>
          {{#organization}}<div class="sub">{{organization}}</div>{{/organization}}
          <div class="dates">{{issueDate}}</div>
        </div>
        {{/certifications}}
      </section>
      {{/hasCertifications}}

      {{#hasLanguages}}
      <section class="sec">
        <h2>Languages</h2>
        <ul class="plain">{{#languages}}<li>{{language}}{{#proficiency}}<span class="prof">{{proficiency}}</span>{{/proficiency}}</li>{{/languages}}</ul>
      </section>
      {{/hasLanguages}}
    </aside>

    <main class="main">
      {{#hasSummary}}
      <section class="sec">
        <h2>Profile</h2>
        <p>{{summary}}</p>
      </section>
      {{/hasSummary}}

      {{#hasExperience}}
      <section class="sec">
        <h2>Experience</h2>
        {{#experience}}
        <div class="entry">
          <h3>{{jobTitle}}</h3>
          <div class="sub"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}<span class="dates">{{dateRange}}</span></div>
          {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
        </div>
        {{/experience}}
      </section>
      {{/hasExperience}}

      {{#hasProjects}}
      <section class="sec">
        <h2>Projects</h2>
        {{#projects}}
        <div class="entry">
          <h3>{{name}}</h3>
          <div class="sub"><span class="co">{{technologies}}</span>{{#href}}<a class="dates" href="{{href}}">{{url}}</a>{{/href}}</div>
          {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
        </div>
        {{/projects}}
      </section>
      {{/hasProjects}}
    </main>
  </div>
</div>$tpl$,
   $tpl$@page { size: A4; margin: 14mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Segoe UI", Calibri, Carlito, "Helvetica Neue", Arial, "Liberation Sans", sans-serif; color: #202b27; font-size: 13px; line-height: 1.5; }
@media print { body { min-height: 0; } }
.page { padding: 0 44px; }
@media screen { .page { padding-top: 48px; padding-bottom: 48px; } }

header { padding-bottom: 16px; border-bottom: 3px solid #2e5a4c; }
h1 { margin: 0; font-size: 34px; line-height: 1.12; font-weight: 700; letter-spacing: -0.01em; color: #1d3f34; overflow-wrap: anywhere; }
.role { margin: 6px 0 0; font-size: 16px; color: #4c5f58; }
a { color: inherit; text-decoration: none; }

.cols { margin-top: 20px; }
.cols::after { content: ""; display: block; clear: both; }
.side { float: left; width: 208px; padding-right: 22px; }
.main { margin-left: 208px; padding-left: 26px; border-left: 1px solid #cfd9d5; min-height: 300px; }
.cols:not(:has(.side .sec)) .main { margin-left: 0; padding-left: 0; border-left: 0; }
.cols:not(:has(.side .sec)) .side { display: none; }

.sec { margin-bottom: 20px; }
.side .sec { margin-bottom: 18px; }
h2 { margin: 0 0 8px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #2e5a4c; break-after: avoid; }
p { margin: 0; overflow-wrap: anywhere; }

.entry { margin-bottom: 13px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
h3 { margin: 0; font-size: 14px; font-weight: 700; color: #1d3f34; overflow-wrap: anywhere; break-after: avoid; }
.side h3 { font-size: 12.5px; line-height: 1.35; }
.sub { color: #3d4d47; overflow-wrap: anywhere; }
.sub:empty { display: none; }
.side .sub { font-size: 12px; }
.main .sub { display: flex; flex-wrap: wrap; gap: 0 14px; align-items: baseline; }
.co { font-weight: 600; color: #2e5a4c; }
.loc { color: #5b6b65; }
.dates { font-size: 12px; color: #5b6b65; overflow-wrap: anywhere; }
.main .dates { margin-left: auto; white-space: nowrap; }
.side .dates { margin-top: 1px; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
ul { margin: 5px 0 0; padding-left: 18px; }
ul:empty { display: none; }
li { margin: 2px 0; overflow-wrap: anywhere; }
li::marker { color: #2e5a4c; }
ul.plain { list-style: none; margin: 0; padding: 0; font-size: 12.5px; }
ul.plain li { margin: 3px 0; }
.prof { display: block; font-size: 11.5px; color: #5b6b65; }$tpl$),
  ('7e3a9c10-2b5d-4f6a-9d01-000000000010', 'simple-ats', 'Simple ATS', 'Plain single-column text with standard headings and no decoration, built to parse cleanly in applicant tracking systems.', 'ATS-friendly', 100, true,
   $tpl$<div class="page">
  <header>
    <h1>{{fullName}}</h1>
    {{#title}}<p class="role">{{title}}</p>{{/title}}
    {{#hasContacts}}
    <ul class="contacts">
      {{#contacts}}<li>{{value}}</li>{{/contacts}}
    </ul>
    {{/hasContacts}}
  </header>

  {{#hasSummary}}
  <section class="sec">
    <h2>Professional Summary</h2>
    <p>{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasExperience}}
  <section class="sec">
    <h2>Work Experience</h2>
    {{#experience}}
    <div class="entry">
      <h3>{{jobTitle}}</h3>
      <p class="meta"><span class="co">{{company}}</span>{{#location}}<span class="loc">{{location}}</span>{{/location}}{{#dateRange}}<span class="dt">{{dateRange}}</span>{{/dateRange}}</p>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/experience}}
  </section>
  {{/hasExperience}}

  {{#hasEducation}}
  <section class="sec">
    <h2>Education</h2>
    {{#education}}
    <div class="entry">
      <h3><span class="deg">{{degree}}</span>{{#fieldOfStudy}}<span class="fos">{{fieldOfStudy}}</span>{{/fieldOfStudy}}</h3>
      <p class="meta"><span class="co">{{institution}}</span>{{#dateRange}}<span class="dt">{{dateRange}}</span>{{/dateRange}}</p>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/education}}
  </section>
  {{/hasEducation}}

  {{#hasSkills}}
  <section class="sec">
    <h2>Skills</h2>
    <p>{{skillsList}}</p>
  </section>
  {{/hasSkills}}

  {{#hasProjects}}
  <section class="sec">
    <h2>Projects</h2>
    {{#projects}}
    <div class="entry">
      <h3>{{name}}</h3>
      <p class="meta"><span class="co">{{technologies}}</span>{{#url}}<span class="dt">{{url}}</span>{{/url}}</p>
      {{#description}}<ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>{{/description}}
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasCertifications}}
  <section class="sec">
    <h2>Certifications</h2>
    <ul>
      {{#certifications}}<li>{{name}}{{#organization}}<span class="org">{{organization}}</span>{{/organization}}{{#issueDate}}<span class="org">{{issueDate}}</span>{{/issueDate}}</li>{{/certifications}}
    </ul>
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section class="sec">
    <h2>Languages</h2>
    <ul>
      {{#languages}}<li>{{language}}{{#proficiency}} ({{proficiency}}){{/proficiency}}</li>{{/languages}}
    </ul>
  </section>
  {{/hasLanguages}}
</div>$tpl$,
   $tpl$@page { size: A4; margin: 15mm 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Arial, Helvetica, "Liberation Sans", sans-serif; color: #000; font-size: 13.5px; line-height: 1.45; }
@media print { body { min-height: 0; } }
.page { padding: 0 54px; }
@media screen { .page { padding-top: 54px; padding-bottom: 54px; } }

h1 { margin: 0; font-size: 26px; line-height: 1.2; font-weight: 700; overflow-wrap: anywhere; }
.role { margin: 3px 0 0; font-size: 14.5px; }
.contacts { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-wrap: wrap; font-size: 13px; }
.contacts li { overflow-wrap: anywhere; }
.contacts li:not(:last-child)::after { content: "|"; margin: 0 8px; }

.sec { margin-top: 18px; }
h2 { margin: 0 0 6px; font-size: 13.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; break-after: avoid; }
p { margin: 0; overflow-wrap: anywhere; }

.entry { margin-bottom: 11px; break-inside: avoid; }
.entry:last-child { margin-bottom: 0; }
h3 { margin: 0; font-size: 13.5px; font-weight: 700; overflow-wrap: anywhere; break-after: avoid; }
.meta { overflow-wrap: anywhere; }
.meta:empty { display: none; }
.loc::before { content: ", "; }
.co:empty + .loc::before { content: ""; }
.dt::before { content: " | "; }
.co:empty + .dt::before, .loc + .dt::before { content: " | "; }
.fos::before { content: ", "; }
.deg:empty + .fos::before { content: ""; }
ul { margin: 4px 0 0; padding-left: 20px; }
ul:empty { display: none; }
li { margin: 2px 0; overflow-wrap: anywhere; }
.org::before { content: " | "; }$tpl$)
on conflict do nothing;
