import type { BlogPost, LandingPage, PortfolioProject, PublicationStatusLabel } from './types';

type ScheduledContent = {
  scheduledPublishAt?: string | null;
  scheduledUnpublishAt?: string | null;
  updatedAt: string;
};

type StatusContent = ScheduledContent & {
  status: 'draft' | 'published';
};

type PublishedFlagContent = ScheduledContent & {
  published: boolean;
};

function toTime(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function nowTime(now = Date.now()) {
  return typeof now === 'number' ? now : Date.now();
}

export function isStatusContentLive(item: StatusContent, now = Date.now()) {
  const current = nowTime(now);
  const publishAt = toTime(item.scheduledPublishAt);
  const unpublishAt = toTime(item.scheduledUnpublishAt);
  const publishReady = item.status === 'published' || (publishAt !== null && publishAt <= current);
  const unpublishExpired = unpublishAt !== null && unpublishAt <= current;
  return publishReady && !unpublishExpired;
}

export function isPageLive(page: PublishedFlagContent, now = Date.now()) {
  const current = nowTime(now);
  const publishAt = toTime(page.scheduledPublishAt);
  const unpublishAt = toTime(page.scheduledUnpublishAt);
  const publishReady = page.published || (publishAt !== null && publishAt <= current);
  const unpublishExpired = unpublishAt !== null && unpublishAt <= current;
  return publishReady && !unpublishExpired;
}

export function getStatusPublicationLabel(item: StatusContent, now = Date.now()): PublicationStatusLabel {
  const current = nowTime(now);
  const publishAt = toTime(item.scheduledPublishAt);
  const unpublishAt = toTime(item.scheduledUnpublishAt);

  if (unpublishAt !== null && unpublishAt <= current) {
    return 'expired';
  }
  if (item.status === 'published') {
    if (unpublishAt !== null && unpublishAt > current) {
      return 'scheduled-unpublish';
    }
    return 'published';
  }
  if (publishAt !== null && publishAt > current) {
    return 'scheduled';
  }
  if (publishAt !== null && publishAt <= current) {
    if (unpublishAt !== null && unpublishAt > current) {
      return 'scheduled-unpublish';
    }
    return 'published';
  }
  return 'draft';
}

export function getPagePublicationLabel(page: PublishedFlagContent, now = Date.now()): PublicationStatusLabel {
  const current = nowTime(now);
  const publishAt = toTime(page.scheduledPublishAt);
  const unpublishAt = toTime(page.scheduledUnpublishAt);

  if (unpublishAt !== null && unpublishAt <= current) {
    return 'expired';
  }
  if (page.published) {
    if (unpublishAt !== null && unpublishAt > current) {
      return 'scheduled-unpublish';
    }
    return 'published';
  }
  if (publishAt !== null && publishAt > current) {
    return 'scheduled';
  }
  if (publishAt !== null && publishAt <= current) {
    if (unpublishAt !== null && unpublishAt > current) {
      return 'scheduled-unpublish';
    }
    return 'published';
  }
  return 'draft';
}

export function isBlogPostLive(post: BlogPost, now = Date.now()) {
  return isStatusContentLive(post, now);
}

export function isPortfolioProjectLive(project: PortfolioProject, now = Date.now()) {
  return isStatusContentLive(project, now);
}

export function getBlogPostPublicationLabel(post: BlogPost, now = Date.now()) {
  return getStatusPublicationLabel(post, now);
}

export function getPortfolioProjectPublicationLabel(project: PortfolioProject, now = Date.now()) {
  return getStatusPublicationLabel(project, now);
}

export function getLandingPagePublicationLabel(page: LandingPage, now = Date.now()) {
  return getPagePublicationLabel(page, now);
}
