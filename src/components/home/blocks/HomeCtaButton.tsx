import Link from 'next/link';

import type { CtaStyleToken } from '@/features/cms/types';

type HomeCtaButtonProps = {
  href: string;
  label: string;
  styleToken?: CtaStyleToken;
};

export function HomeCtaButton({ href, label, styleToken = 'primary' }: HomeCtaButtonProps) {
  const showArrow = styleToken !== 'primary';

  return (
    <Link href={href} className={`v2-btn v2-btn-${styleToken}`}>
      <span>{label}</span>
      {showArrow ? <span aria-hidden="true">↗</span> : null}
    </Link>
  );
}
