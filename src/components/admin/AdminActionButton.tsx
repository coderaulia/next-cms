'use client';

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { cn } from '@/lib/utils';

type AdminActionVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type AdminActionSize = 'md' | 'sm';

type BaseProps = {
  children: ReactNode;
  icon?: string;
  variant?: AdminActionVariant;
  size?: AdminActionSize;
  className?: string;
};

type AdminActionLinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & {
    href: string;
  };

type AdminActionNativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    href?: never;
  };

type Props = AdminActionLinkProps | AdminActionNativeButtonProps;

function buildClasses(variant: AdminActionVariant, size: AdminActionSize, className?: string) {
  return cn(
    'admin-action-btn',
    `admin-action-btn-${variant}`,
    size === 'sm' ? 'admin-action-btn-sm' : null,
    className
  );
}

function ActionContent({ icon, children }: Pick<BaseProps, 'icon' | 'children'>) {
  return (
    <>
      {icon ? <SymbolIcon className="admin-action-btn-icon" name={icon} /> : null}
      <span>{children}</span>
    </>
  );
}

function AdminActionLink({
  children,
  icon,
  variant = 'secondary',
  size = 'md',
  className,
  ...anchorProps
}: AdminActionLinkProps) {
  return (
    <a className={buildClasses(variant, size, className)} {...anchorProps}>
      <ActionContent icon={icon}>{children}</ActionContent>
    </a>
  );
}

function AdminActionNativeButton({
  children,
  icon,
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...buttonProps
}: AdminActionNativeButtonProps) {
  return (
    <button className={buildClasses(variant, size, className)} type={type} {...buttonProps}>
      <ActionContent icon={icon}>{children}</ActionContent>
    </button>
  );
}

export function AdminActionButton(props: Props) {
  if ('href' in props && typeof props.href === 'string') {
    return <AdminActionLink {...props} />;
  }

  return <AdminActionNativeButton {...props} />;
}
