/**
 * Client-only learning progress for Home / Learn "Continue" chips.
 * Never stores keys, seeds, or wallet secrets — path + title only.
 */

import { LEARNING_PATH } from "@/lib/learning-path";

export type LearnProgress = {
  path: string;
  title: string;
  updatedAt: number;
};

export const LEARN_PROGRESS_KEY = "shipx402.learnProgress.v1";

const TRACKED_EXACT = new Set(["/loop", "/wallet"]);

function isTrackedPath(path: string): boolean {
  return TRACKED_EXACT.has(path) || path.startsWith("/guides/");
}

export function titleForLearnPath(path: string): string {
  const fromPath = LEARNING_PATH.find((item) => item.path === path);
  if (fromPath) return fromPath.title;
  switch (path) {
    case "/learn":
      return "Learn Path";
    case "/loop":
      return "Walk the Loop";
    case "/wallet":
      return "How Keys Work";
    default:
      return "Continue Learning";
  }
}

export function getLearnProgress(): LearnProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEARN_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LearnProgress>;
    if (
      typeof parsed.path !== "string" ||
      !parsed.path.startsWith("/") ||
      typeof parsed.title !== "string" ||
      typeof parsed.updatedAt !== "number"
    ) {
      return null;
    }
    if (!isTrackedPath(parsed.path)) return null;
    return {
      path: parsed.path,
      title: parsed.title,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function markLearnProgress(path: string, title?: string): void {
  if (typeof window === "undefined") return;
  if (!isTrackedPath(path)) return;
  const record: LearnProgress = {
    path,
    title: title ?? titleForLearnPath(path),
    updatedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(LEARN_PROGRESS_KEY, JSON.stringify(record));
  } catch {
    /* private mode / quota — Continue chips simply stay hidden */
  }
}
