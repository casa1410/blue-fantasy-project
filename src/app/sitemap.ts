import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const novels = await prisma.novel.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      updatedAt: true,
      chapters: {
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      },
    },
  });

  const entries: MetadataRoute.Sitemap = [{ url: siteUrl, changeFrequency: "daily", priority: 1 }];

  for (const novel of novels) {
    entries.push({
      url: `${siteUrl}/novels/${novel.slug}`,
      lastModified: novel.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const chapter of novel.chapters) {
      entries.push({
        url: `${siteUrl}/novels/${novel.slug}/${chapter.slug}`,
        lastModified: chapter.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
