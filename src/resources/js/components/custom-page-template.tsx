import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { FloatingChatGpt } from '@/components/FloatingChatGpt';

export interface PageAction {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick?: () => void;
}

export interface PageTemplateProps {
  title: string;
  description?: string;
  url: string;
  actions?: PageAction[];
  children: ReactNode;
  noPadding?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  extraFilters?: ReactNode;        // <-- 🔥 new prop added
}

export function PageTemplate({
  title,
  description,
  url,
  actions,
  children,
  noPadding = false,
  breadcrumbs,
  extraFilters                    // <-- 🔥 add prop here
}: PageTemplateProps) {

  const pageBreadcrumbs: BreadcrumbItem[] = breadcrumbs || [
    {
      title,
      href: url,
    },
  ];

  return (
    <AppLayout breadcrumbs={pageBreadcrumbs}>
      <Head title={`${title} - ${(usePage().props as any).globalSettings?.titleText || 'HRM'}`} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">

        {/* Header: Title + Filters + Actions */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* Left: Title + Date Range */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{title}</h1>

            {/* 🔥 show date range filter here */}
            {extraFilters && (
              <div className="hidden md:block">
                {extraFilters}
              </div>
            )}
          </div>

          {/* Right: Action Buttons */}
          {actions && actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className="cursor-pointer"
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile visibility for date range */}
        {extraFilters && (
          <div className="md:hidden">
            {extraFilters}
          </div>
        )}

        {/* Content */}
        <div className={noPadding ? "" : "rounded-xl border p-6"}>
          {children}
        </div>
      </div>

      <FloatingChatGpt />
    </AppLayout>
  );
}
