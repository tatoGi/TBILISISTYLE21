export default function AdminPageLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="ts21-page-loading" role="status">
      <div className="ts21-page-loading__spinner" />
      <p className="ts21-page-loading__text">იტვირთება…</p>
    </div>
  );
}
