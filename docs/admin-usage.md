# Admin Usage Guide

## Accessing Admin

1. Open `/admin`.
2. Enter `CMS_ADMIN_TOKEN` value from `.env.local`.
3. Use top navigation to manage pages or blog posts.

## Editing Landing Pages

Go to `/admin/pages` then choose a page.

You can edit:
- Page settings (title, nav label, publish flag)
- SEO fields (meta title, meta description, slug, canonical, social image, noindex)
- Section blocks:
  - structure (`stacked` / `split`)
  - heading/body/call-to-action
  - media image + alt text
  - colors (background, text, accent)

Save to apply changes instantly.

## Managing Blog Posts

Go to `/admin/blog`.

Available flow:
1. Create draft
2. Edit content and SEO fields
3. Publish when ready
4. Unpublish if needed
5. Delete if no longer needed

## Publishing Checklist

Before publishing a page/post:
- Confirm SEO title and description
- Confirm clean slug
- Confirm canonical URL strategy
- Confirm social image URL
- Confirm `noindex` is off for public content
