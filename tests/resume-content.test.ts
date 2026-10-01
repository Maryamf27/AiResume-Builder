import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyResumeData } from '../lib/resume/constants';
import { hasResumeContent, shouldPersistResumeDraft } from '../lib/resume/guest-import';

test('empty resume has no content', () => {
  assert.equal(hasResumeContent(createEmptyResumeData()), false);
});

test('name field counts as meaningful content', () => {
  const data = createEmptyResumeData();
  data.personal.firstName = 'Ada';
  assert.equal(hasResumeContent(data), true);
});

test('title-only drafts should not persist', () => {
  const data = createEmptyResumeData();
  assert.equal(shouldPersistResumeDraft(data, 'Project Plan', false), false);
});

test('meaningful data should persist', () => {
  const data = createEmptyResumeData();
  data.personal.firstName = 'Ada';
  assert.equal(shouldPersistResumeDraft(data, 'Project Plan', false), true);
});
