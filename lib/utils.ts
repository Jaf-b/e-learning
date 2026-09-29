import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAssessmentAvailable(dueDate: string | null | undefined): {
  isAvailable: boolean;
  isFuture: boolean;
  formattedDate: string | null;
} {
  if (!dueDate) {
    return { isAvailable: true, isFuture: false, formattedDate: null };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const formattedDate = due.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (today < due) {
    return { isAvailable: false, isFuture: true, formattedDate };
  }

  return { isAvailable: true, isFuture: false, formattedDate };
}
