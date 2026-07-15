import { requireAdminUser } from "@/lib/auth";
import { NovelForm } from "@/components/admin/novel-form";

export default async function NewNovelPage() {
  await requireAdminUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Nueva novela</h1>
      <div className="mt-8">
        <NovelForm />
      </div>
    </div>
  );
}
