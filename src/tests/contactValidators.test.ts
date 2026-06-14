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

  it('rejects oversized contact submission fields', () => {
    const payload = validateContactSubmission({
      name: 'Alex',
      company: 'Vanaila',
      email: 'hello@example.com',
      serviceCategory: 'Website Development',
      projectOverview: 'x'.repeat(5001)
    });

    expect(payload).toBeNull();
  });

  it('accepts multi-select serviceCategory (comma-joined valid services)', () => {
    const payload = validateContactSubmission({
      name: 'Alex',
      email: 'hello@example.com',
      serviceCategory: 'Website Development, Partnership / Referral',
      projectOverview: 'Two services.'
    });
    expect(payload).not.toBeNull();
    expect(payload?.serviceCategory).toBe('Website Development, Partnership / Referral');
  });

  it('rejects serviceCategory with unknown service value', () => {
    const payload = validateContactSubmission({
      name: 'Alex',
      email: 'hello@example.com',
      serviceCategory: 'Hacking Services',
      projectOverview: 'Malicious intent.'
    });
    expect(payload).toBeNull();
  });

  it('rejects serviceCategory that mixes valid and invalid values', () => {
    const payload = validateContactSubmission({
      name: 'Alex',
      email: 'hello@example.com',
      serviceCategory: 'Website Development, <script>alert(1)</script>',
      projectOverview: 'Mixed payload.'
    });
    expect(payload).toBeNull();
  });

  it('rejects empty serviceCategory', () => {
    const payload = validateContactSubmission({
      name: 'Alex',
      email: 'hello@example.com',
      serviceCategory: '   ',
      projectOverview: 'Blank category.'
    });
    expect(payload).toBeNull();
  });

  it('validates contact submission status values', () => {
    expect(validateContactSubmissionStatus('new')).toBe('new');
    expect(validateContactSubmissionStatus('closed')).toBe('closed');
    expect(validateContactSubmissionStatus('unknown')).toBeNull();
  });
});
