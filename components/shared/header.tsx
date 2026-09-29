import { buttonVariants } from "@/components/ui/button"
import { ArrowUpRight, BookOpenCheck, Plus } from "lucide-react"
import Link from "next/link";
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  linkHref?: string
}

export default function Header({
  title,
  description,
  buttonText,
  buttonLink,
  linkHref,
}: HeaderProps) {
  const targetLink = buttonLink || linkHref
  const actionText = buttonText || (linkHref ? "Accéder" : undefined)

  return (
    <header className="relative isolate w-full overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.09] via-card to-card px-5 py-5 shadow-xs sm:px-7 sm:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-20 -z-10 size-64 rounded-full bg-primary/[0.08] blur-3xl"
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:flex">
            <BookOpenCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Espace pédagogique
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </div>
        </div>

        {targetLink && actionText && (
          <Link
            href={targetLink}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full shrink-0 rounded-xl shadow-sm sm:w-auto"
            )}
          >
            {buttonText ? <Plus className="size-4" /> : null}
            {actionText}
            {!buttonText && <ArrowUpRight className="size-3.5 opacity-75" />}
          </Link>
        )}
      </div>
    </header>
  )
}