import React from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Award, Layers, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCourseCardProps {
    id: string;
    code: string;
    title: string;
    description?: string | null;
    status: string;
    moduleCount?: number;
    credits?: number;
    href?: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    PUBLISHED: {
        label: "Publié",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle className="w-3 h-3" />,
    },
    DRAFT: {
        label: "Brouillon",
        className: "bg-slate-100 text-slate-600 border-slate-200",
        icon: <Clock className="w-3 h-3" />,
    },
    PENDING_REVIEW: {
        label: "En révision",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock className="w-3 h-3" />,
    },
    REJECTED: {
        label: "Rejeté",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: <Clock className="w-3 h-3" />,
    },
};

export default function DashboardCourseCard({
    id,
    code,
    title,
    description,
    status,
    moduleCount = 0,
    credits,
    href,
}: DashboardCourseCardProps) {
    const link = href ?? `/teacher/courses/${id}`;
    const statusInfo = statusConfig[status] ?? statusConfig["DRAFT"];

    return (
        <Card className="group flex flex-col justify-between border hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden">
            {/* Color accent top bar */}
            <div className={cn("h-1 w-full", status === "PUBLISHED" ? "bg-emerald-400" : status === "PENDING_REVIEW" ? "bg-amber-400" : "bg-slate-300")} />

            <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 shrink-0">
                        {code}
                    </Badge>
                    <Badge className={cn("text-[10px] px-2 py-0.5 flex items-center gap-1 font-medium border", statusInfo.className)}>
                        {statusInfo.icon}
                        {statusInfo.label}
                    </Badge>
                </div>

                <h3 className="font-bold text-sm text-foreground line-clamp-2 mt-2.5 group-hover:text-primary transition-colors leading-snug">
                    {title}
                </h3>

                {description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {description}
                    </p>
                )}
            </CardHeader>

            <CardContent className="pb-3">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        {moduleCount} module{moduleCount !== 1 ? "s" : ""}
                    </span>
                    {credits !== undefined && (
                        <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                            {credits} crédit{credits !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            </CardContent>

            <CardFooter className="border-t pt-3 bg-muted/30">
                <Link
                    href={link}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                >
                    Ouvrir le cours
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </CardFooter>
        </Card>
    );
}
