/**
 * A working example for the admin editor. Placeholders use {{name}}; lists use
 * {{#experience}} ... {{/experience}}; sections are wrapped in {{#hasX}} so they
 * disappear when empty. Use system font stacks: external fonts are blocked.
 */
export const STARTER_HTML = `<div class="page">
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
  <section>
    <h2>Summary</h2>
    <p>{{summary}}</p>
  </section>
  {{/hasSummary}}

  {{#hasExperience}}
  <section>
    <h2>Experience</h2>
    {{#experience}}
    <div class="entry">
      <div class="row">
        <strong>{{jobTitle}}{{#company}} · {{company}}{{/company}}</strong>
        <span class="muted">{{dateRange}}</span>
      </div>
      {{#location}}<div class="muted">{{location}}</div>{{/location}}
      <ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>
    </div>
    {{/experience}}
  </section>
  {{/hasExperience}}

  {{#hasEducation}}
  <section>
    <h2>Education</h2>
    {{#education}}
    <div class="entry">
      <div class="row">
        <strong>{{degree}}{{#fieldOfStudy}}, {{fieldOfStudy}}{{/fieldOfStudy}}</strong>
        <span class="muted">{{dateRange}}</span>
      </div>
      <div class="muted">{{institution}}</div>
    </div>
    {{/education}}
  </section>
  {{/hasEducation}}

  {{#hasSkills}}
  <section>
    <h2>Skills</h2>
    <p>{{skillsList}}</p>
  </section>
  {{/hasSkills}}

  {{#hasProjects}}
  <section>
    <h2>Projects</h2>
    {{#projects}}
    <div class="entry">
      <strong>{{name}}</strong>{{#technologies}} <span class="muted">· {{technologies}}</span>{{/technologies}}
      <ul>{{#descriptionLines}}<li>{{text}}</li>{{/descriptionLines}}</ul>
    </div>
    {{/projects}}
  </section>
  {{/hasProjects}}

  {{#hasCertifications}}
  <section>
    <h2>Certifications</h2>
    {{#certifications}}
    <div class="row"><span>{{name}}{{#organization}} · {{organization}}{{/organization}}</span><span class="muted">{{issueDate}}</span></div>
    {{/certifications}}
  </section>
  {{/hasCertifications}}

  {{#hasLanguages}}
  <section>
    <h2>Languages</h2>
    <p>{{#languages}}<span class="lang">{{language}} ({{proficiency}})</span>{{/languages}}</p>
  </section>
  {{/hasLanguages}}
</div>`;

export const STARTER_CSS = `body { font-family: Georgia, "Times New Roman", serif; color: #1f2421; font-size: 13px; line-height: 1.5; }
.page { padding: 56px 60px; }
h1 { font-size: 34px; font-weight: 400; margin: 0; letter-spacing: -0.01em; }
.role { margin: 4px 0 0; font-size: 15px; color: #4a6b53; font-family: Helvetica, Arial, sans-serif; }
.contacts { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 12px 0 0; padding: 0; color: #5b615d; font-family: Helvetica, Arial, sans-serif; font-size: 12px; }
section { margin-top: 24px; }
h2 { font-family: Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #3d5a45; border-bottom: 1px solid #ddd8cc; padding-bottom: 4px; margin: 0 0 10px; }
.entry { margin-bottom: 12px; }
.row { display: flex; justify-content: space-between; gap: 16px; }
.muted { color: #6f746f; }
ul { margin: 4px 0 0; padding-left: 18px; }
li { margin: 2px 0; }
p { margin: 0; }
.lang { margin-right: 14px; }
`;
