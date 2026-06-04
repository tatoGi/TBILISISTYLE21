import type { ReactNode } from "react";
import { redirect } from "next/navigation";
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
  // With autoLogin disabled in production, unauthenticated requests reach these
  // custom views with no user (and sometimes no initPageResult). Rendering the
  // template without a user throws a 500, so send them to the login screen.
  if (!initPageResult?.req?.user) {
    redirect("/admin/login");
  }

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
