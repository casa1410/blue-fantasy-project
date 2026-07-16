import { requireAdminUser } from "@/lib/auth";
import { NovelForm } from "@/components/admin/novel-form";

export default async function NewNovelPage() {
  await requireAdminUser();

  return (
    <div>
      <h1 className="admin-page-title">Nueva novela</h1>
      <div className="admin-card mt-8 max-w-2xl">
        <NovelForm />
      </div>
    </div>
  );
}
