import { redirect } from "next/navigation";

// The native collection list (/admin/collections/partners) is replaced by our
// unified Velzon list at /admin/partners. Payload still routes here after a save
// or via the document breadcrumb, so we redirect to keep the experience on the
// custom view instead of bouncing back to the old Payload list.
export default function PartnersCollectionList() {
  redirect("/admin/partners");
}
