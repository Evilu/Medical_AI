import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAuthors(authors: string, max = 3): string {
  if (!authors) return "";
  const list = authors.split(", ");
  if (list.length <= max) return authors;
  return list.slice(0, max).join(", ") + " et al.";
}
