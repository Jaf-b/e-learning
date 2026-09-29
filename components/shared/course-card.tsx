import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Layers,
  Award,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  User,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CourseCardProps {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  status?: string | null;
  credits?: number | null;
  filiereName?: string | null;
  degreeLevelName?: string | null;
  authorName?: string | null;
  moduleCount?: number;
  href?: string;
  onClick?: () => void;
  actionLabel?: string;
  className?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<
  string,
  { label: string; className: string; borderAccent: string; icon: React.ReactNode }
> = {
  PUBLISHED: {
    label: "Publié",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    borderAccent: "bg-emerald-500",
    icon: <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
  },
  DRAFT: {
    label: "Brouillon",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    borderAccent: "bg-slate-400",
    icon: <Clock className="w-3 h-3 text-slate-500" />,
  },
  PENDING_REVIEW: {
    label: "En révision",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    borderAccent: "bg-amber-500",
    icon: <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
  },
  REJECTED: {
    label: "Rejeté",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    borderAccent: "bg-rose-500",
    icon: <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />,
  },
  ARCHIVED: {
    label: "Archivé",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    borderAccent: "bg-gray-400",
    icon: <Archive className="w-3 h-3 text-gray-500" />,
  },
};

export default function CourseCard({
  id,
  code,
  title,
  description,
  status = "DRAFT",
  credits,
  filiereName,
  degreeLevelName,
  authorName,
  moduleCount,
  href,
  onClick,
  actionLabel = "Voir le cours",
  className,
}: CourseCardProps) {
  const courseLink = href ?? `/teacher/courses/${id}`;
  const statusInfo = statusConfig[status || "DRAFT"] ?? statusConfig["DRAFT"];

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl bg-card border border-border/70 hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden",
        className
      )}
    >
      {/* Accent Color Top Bar */}
      <div className={cn("h-1.5 w-full transition-colors", statusInfo.borderAccent)} />

      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
        {/* Top Header Row: Code & Status */}
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <BookOpen className="w-3.5 h-3.5" />
              {code}
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs",
                statusInfo.className
              )}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed font-normal">
            {description ?? "Aucune description renseignée pour ce cours."}
          </p>
        </div>

        {/* Metadata badges & info */}
        <div className="pt-2 border-t border-border/50 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {credits !== undefined && credits !== null && (
              <span className="inline-flex items-center gap-1 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md">
                <Award className="w-3.5 h-3.5 shrink-0" />
                {credits} crédit{credits > 1 ? "s" : ""}
              </span>
            )}

            {moduleCount !== undefined && (
              <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                <Layers className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                {moduleCount} module{moduleCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {(filiereName || degreeLevelName) && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/80 truncate">
              <GraduationCap className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate">
                {[filiereName, degreeLevelName].filter(Boolean).join(" • ")}
              </span>
            </div>
          )}

          {authorName && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/80 truncate">
              <User className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{authorName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="px-5 py-3 bg-muted/40 border-t border-border/50 flex items-center justify-between">
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="w-full inline-flex items-center justify-between text-xs font-bold text-primary group-hover:text-primary/90 transition-colors cursor-pointer"
          >
            <span>{actionLabel}</span>
            <div className="p-1 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ) : (
          <Link
            href={courseLink}
            className="w-full inline-flex items-center justify-between text-xs font-bold text-primary group-hover:text-primary/90 transition-colors"
          >
            <span>{actionLabel}</span>
            <div className="p-1 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
