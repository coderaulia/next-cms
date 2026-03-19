import type { BlogPost, HomeBlock, LandingPage, PageSection, PortfolioProject } from '@/features/cms/types';

export type EditorValidationIssue = {
  path: string;
  message: string;
};

function isBlank(value: string | null | undefined) {
  return !value || value.trim().length === 0;
}

function hasInvalidSlugChars(value: string) {
  return !/^[a-z0-9-\/]+$/.test(value);
}

function pushRequired(
  issues: EditorValidationIssue[],
  path: string,
  value: string | null | undefined,
  label: string
) {
  if (isBlank(value)) {
    issues.push({ path, message: `${label} is required.` });
  }
}

function validateSeo(
  issues: EditorValidationIssue[],
  pathPrefix: string,
  seo: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
  }
) {
  pushRequired(issues, `${pathPrefix}.metaTitle`, seo.metaTitle, 'Meta title');
  pushRequired(issues, `${pathPrefix}.metaDescription`, seo.metaDescription, 'Meta description');
  pushRequired(issues, `${pathPrefix}.slug`, seo.slug, 'Slug');

  if (!isBlank(seo.slug) && hasInvalidSlugChars(seo.slug.trim())) {
    issues.push({
      path: `${pathPrefix}.slug`,
      message: 'Slug can only contain lowercase letters, numbers, hyphens, and slashes.'
    });
  }
}

function validateSection(issues: EditorValidationIssue[], section: PageSection, index: number) {
  pushRequired(issues, `sections.${index}.heading`, section.heading, 'Section heading');
  pushRequired(issues, `sections.${index}.body`, section.body, 'Section body');

  if (!isBlank(section.ctaLabel) && isBlank(section.ctaHref)) {
    issues.push({
      path: `sections.${index}.ctaHref`,
      message: 'CTA URL is required when CTA label is set.'
    });
  }

  if (!isBlank(section.mediaImage) && isBlank(section.mediaAlt)) {
    issues.push({
      path: `sections.${index}.mediaAlt`,
      message: 'Alt text is required when a section image is set.'
    });
  }
}

function validateSchedule(
  issues: EditorValidationIssue[],
  pathPrefix: string,
  schedule: {
    scheduledPublishAt?: string | null;
    scheduledUnpublishAt?: string | null;
  }
) {
  const withPrefix = (field: 'scheduledPublishAt' | 'scheduledUnpublishAt') =>
    pathPrefix ? `${pathPrefix}.${field}` : field;
  const publishAt = schedule.scheduledPublishAt ? new Date(schedule.scheduledPublishAt).getTime() : null;
  const unpublishAt = schedule.scheduledUnpublishAt ? new Date(schedule.scheduledUnpublishAt).getTime() : null;

  if (publishAt !== null && Number.isNaN(publishAt)) {
    issues.push({ path: withPrefix('scheduledPublishAt'), message: 'Scheduled publish time is invalid.' });
  }
  if (unpublishAt !== null && Number.isNaN(unpublishAt)) {
    issues.push({ path: withPrefix('scheduledUnpublishAt'), message: 'Scheduled unpublish time is invalid.' });
  }
  if (publishAt !== null && unpublishAt !== null && publishAt >= unpublishAt) {
    issues.push({
      path: withPrefix('scheduledUnpublishAt'),
      message: 'Scheduled unpublish time must be after the scheduled publish time.'
    });
  }
}

function validateHomeBlock(issues: EditorValidationIssue[], block: HomeBlock, index: number) {
  pushRequired(issues, `homeBlocks.${index}.id`, block.id, 'Block ID');

  if (!block.enabled) {
    return;
  }

  if (block.type === 'hero') {
    pushRequired(issues, `homeBlocks.${index}.titlePrimary`, block.titlePrimary, 'Hero primary title');
    pushRequired(issues, `homeBlocks.${index}.titleAccent`, block.titleAccent, 'Hero accent title');
    pushRequired(issues, `homeBlocks.${index}.description`, block.description, 'Hero description');
    pushRequired(issues, `homeBlocks.${index}.primaryCtaLabel`, block.primaryCtaLabel, 'Hero primary CTA label');
    pushRequired(issues, `homeBlocks.${index}.primaryCtaHref`, block.primaryCtaHref, 'Hero primary CTA URL');
    return;
  }

  if (block.type === 'value_triplet') {
    if (block.items.length === 0) {
      issues.push({ path: `homeBlocks.${index}.items`, message: 'Value triplet needs at least one item.' });
      return;
    }
    block.items.forEach((item, itemIndex) => {
      pushRequired(
        issues,
        `homeBlocks.${index}.items.${itemIndex}.title`,
        item.title,
        'Value item title'
      );
      pushRequired(
        issues,
        `homeBlocks.${index}.items.${itemIndex}.text`,
        item.text,
        'Value item text'
      );
    });
    return;
  }

  if (block.type === 'solutions_grid') {
    pushRequired(issues, `homeBlocks.${index}.heading`, block.heading, 'Solutions heading');
    if (block.items.length === 0) {
      issues.push({ path: `homeBlocks.${index}.items`, message: 'Solutions grid needs at least one card.' });
      return;
    }
    block.items.forEach((item, itemIndex) => {
      pushRequired(
        issues,
        `homeBlocks.${index}.items.${itemIndex}.title`,
        item.title,
        'Solution title'
      );
      pushRequired(
        issues,
        `homeBlocks.${index}.items.${itemIndex}.text`,
        item.text,
        'Solution text'
      );
      pushRequired(
        issues,
        `homeBlocks.${index}.items.${itemIndex}.ctaHref`,
        item.ctaHref,
        'Solution CTA URL'
      );
    });
    return;
  }

  if (block.type === 'why_split') {
    pushRequired(issues, `homeBlocks.${index}.heading`, block.heading, 'Why section heading');
    pushRequired(issues, `homeBlocks.${index}.description`, block.description, 'Why section description');
    if (block.bullets.length === 0) {
      issues.push({ path: `homeBlocks.${index}.bullets`, message: 'Why section needs at least one bullet.' });
      return;
    }
    block.bullets.forEach((item, itemIndex) => {
      pushRequired(
        issues,
        `homeBlocks.${index}.bullets.${itemIndex}.title`,
        item.title,
        'Why bullet title'
      );
      pushRequired(
        issues,
        `homeBlocks.${index}.bullets.${itemIndex}.text`,
        item.text,
        'Why bullet text'
      );
    });
    if (!isBlank(block.mediaImage) && isBlank(block.mediaAlt)) {
      issues.push({
        path: `homeBlocks.${index}.mediaAlt`,
        message: 'Alt text is required when the why-split image is set.'
      });
    }
    return;
  }

  if (block.type === 'logo_cloud') {
    pushRequired(issues, `homeBlocks.${index}.heading`, block.heading, 'Logo cloud heading');
    if (block.logos.length === 0) {
      issues.push({ path: `homeBlocks.${index}.logos`, message: 'Logo cloud needs at least one logo label.' });
    }
    pushRequired(issues, `homeBlocks.${index}.primaryCtaLabel`, block.primaryCtaLabel, 'Primary CTA label');
    pushRequired(issues, `homeBlocks.${index}.primaryCtaHref`, block.primaryCtaHref, 'Primary CTA URL');
    return;
  }

  if (block.type === 'primary_cta') {
    pushRequired(issues, `homeBlocks.${index}.heading`, block.heading, 'Primary CTA heading');
    pushRequired(issues, `homeBlocks.${index}.ctaLabel`, block.ctaLabel, 'Primary CTA button label');
    pushRequired(issues, `homeBlocks.${index}.ctaHref`, block.ctaHref, 'Primary CTA button URL');
  }
}

export function validateBlogEditor(post: BlogPost) {
  const issues: EditorValidationIssue[] = [];
  pushRequired(issues, 'title', post.title, 'Title');
  pushRequired(issues, 'author', post.author, 'Author');
  pushRequired(issues, 'content', post.content, 'Content');
  validateSeo(issues, 'seo', post.seo);
  validateSchedule(issues, '', post);
  return issues;
}

export function validatePageEditor(page: LandingPage) {
  const issues: EditorValidationIssue[] = [];
  pushRequired(issues, 'title', page.title, 'Title');
  pushRequired(issues, 'navLabel', page.navLabel, 'Nav label');
  validateSeo(issues, 'seo', page.seo);
  validateSchedule(issues, '', page);

  if (page.id === 'home') {
    const blocks = page.homeBlocks ?? [];
    if (blocks.length === 0) {
      issues.push({ path: 'homeBlocks', message: 'Homepage requires at least one block.' });
      return issues;
    }

    const ids = new Set<string>();
    blocks.forEach((block, index) => {
      if (block.id && ids.has(block.id)) {
        issues.push({ path: `homeBlocks.${index}.id`, message: 'Block ID must be unique.' });
      }
      if (block.id) ids.add(block.id);
      validateHomeBlock(issues, block, index);
    });
    return issues;
  }

  if (page.sections.length === 0) {
    issues.push({ path: 'sections', message: 'Page requires at least one section.' });
    return issues;
  }

  page.sections.forEach((section, index) => {
    validateSection(issues, section, index);
  });

  return issues;
}

export function validatePortfolioEditor(project: PortfolioProject) {
  const issues: EditorValidationIssue[] = [];
  pushRequired(issues, 'title', project.title, 'Title');
  pushRequired(issues, 'summary', project.summary, 'Summary');
  pushRequired(issues, 'challenge', project.challenge, 'Challenge');
  pushRequired(issues, 'solution', project.solution, 'Solution');
  pushRequired(issues, 'outcome', project.outcome, 'Outcome');
  pushRequired(issues, 'clientName', project.clientName, 'Client name');
  pushRequired(issues, 'serviceType', project.serviceType, 'Service type');
  validateSeo(issues, 'seo', project.seo);
  validateSchedule(issues, '', project);
  return issues;
}

export function toFieldErrorMap(issues: EditorValidationIssue[]) {
  return issues.reduce<Record<string, string>>((acc, issue) => {
    if (!acc[issue.path]) {
      acc[issue.path] = issue.message;
    }
    return acc;
  }, {});
}

export function formatSavedAtLabel(value: string | null) {
  if (!value) {
    return 'Not saved yet';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not saved yet';
  }

  return `Saved at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}
