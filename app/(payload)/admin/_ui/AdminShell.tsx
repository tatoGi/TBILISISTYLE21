import type { ReactNode } from "react";
import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { SetStepNav, type StepNavItem } from "@payloadcms/ui";

/**
 * Wraps a custom admin view in Payload's `DefaultTemplate` so the sidebar (Nav)
 * and top header render around it - exactly like the built-in collection pages.
 *
 * Payload only auto-applies the template to its own built-in routes; custom root
 * views (anything registered under `admin.components.views` with a `path`) render
 * bare unless they render the template themselves. Every custom view in this
 * folder should return its content wrapped in <AdminShell {...props}>.
 *
 * `breadcrumb` feeds the native header step-nav (the home icon is prepended
 * automatically), giving a consistent breadcrumb trail across every page.
 */
type AdminShellProps = Pick<
  AdminViewServerProps,
  "initPageResult" | "params" | "searchParams"
> & {
  breadcrumb?: StepNavItem[];
  children: ReactNode;
};

export function AdminShell({
  breadcrumb,
  children,
  initPageResult,
  params,
  searchParams,
}: AdminShellProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult;

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={req.user ?? undefined}
      viewType="dashboard"
      visibleEntities={visibleEntities}
    >
      <SetStepNav nav={breadcrumb ?? []} />
      {children}
    </DefaultTemplate>
  );
}
