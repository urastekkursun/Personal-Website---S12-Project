/**
 * `cases.js`'teki saf doğrulamayı gerçek içerikle çalıştıran uygulama tarafı.
 * Prerender aynı doğrulamayı Node'dan, kendi okuduğu JSON ile çağırır.
 */
import content from "./content.json";
import { collectCases } from "./cases";
import { logError } from "../utils/env";

const { publishedIndexes, bySlug, byProjectId, drafts } = collectCases(
  content.cases?.items,
  logError
);

export const PUBLISHED_CASE_INDEXES = publishedIndexes;
export const CASE_DRAFT_SLUGS = drafts;

/** Slug → çevrilmiş `t.cases.items` içindeki dizin. Yoksa `null`. */
export function caseIndexBySlug(slug) {
  return bySlug.has(slug) ? bySlug.get(slug) : null;
}

/** Bir projenin yayınlanmış vakası varsa `{ slug, index }`, yoksa `null`. */
export function caseForProject(projectId) {
  return byProjectId.get(projectId) ?? null;
}
