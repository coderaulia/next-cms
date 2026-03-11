import { describe, expect, it } from 'vitest';

import {
  validateContactSubmission,
  validateContactSubmissionStatus
} from '@/features/cms/validators';

describe('contact submission validation', () => {
  it('accepts a valid contact submission payload', () => {
    const payload = validateContactSubmission({
      name: 'Alex',
      company: 'Vanaila',
      email: 'hello@example.com',
      serviceCategory: 'Website Development',
      projectOverview: 'We need a new website.'
    });

    expect(payload).not.toBeNull();
    expect(payload?.status).toBe('new');
  });

  it('rejects an invalid contact submission payload', () => {
    const payload = validateContactSubmission({
      name: '',
      email: 'invalid',
      serviceCategory: '',
      projectOverview: ''
    });

    expect(payload).toBeNull();
  });

  it('validates contact submission status values', () => {
    expect(validateContactSubmissionStatus('new')).toBe('new');
    expect(validateContactSubmissionStatus('closed')).toBe('closed');
    expect(validateContactSubmissionStatus('unknown')).toBeNull();
  });
});

