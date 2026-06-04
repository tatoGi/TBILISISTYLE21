import type { ReactNode } from "react";
import Link from "next/link";
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
  // With autoLogin disabled, unauthenticated requests reach these custom views
  // with no user (and sometimes no initPageResult). Rendering Payload's
  // DefaultTemplate without a user throws ("page could not load"), and an
  // in-render redirect() gets swallowed by the admin shell — so render a small
  // self-contained login prompt instead.
  if (!initPageResult?.req?.user) {
    return (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            You are signed out
          </h1>
          <p style={{ marginBottom: 20, opacity: 0.7 }}>
            Please log in to access the admin panel.
          </p>
          <Link
            href="/admin/login"
            style={{
              background: "var(--theme-elevation-1000, #111)",
              borderRadius: 8,
              color: "var(--theme-elevation-0, #fff)",
              display: "inline-block",
              fontWeight: 700,
              padding: "10px 20px",
              textDecoration: "none",
            }}
          >
            Go to login
          </Link>
        </div>
      </div>
    );
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
