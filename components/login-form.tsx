"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Loging } from "@/lib/action/authentication.actions";
import { toast } from "@/components/ui/toast";

const loginSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide."),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    try {
      const result = await Loging({
        email: values.email,
        password: values.password,
        callbackUrl: "/dashboard",
      });

      if (!result.success) {
        toast.add({
          type: "error",
          description: result.error || "Identifiants invalides. Veuillez réessayer.",
        });
        setLoading(false);
        return;
      }

      toast.add({
        type: "success",
        description: "Connexion réussie ! Redirection...",
      });

      const role = result.user?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    } catch {
      toast.add({
        type: "error",
        description: "Une erreur inattendue s'est produite.",
      });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight leading-none">Academia</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Portail E-Learning</span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-border/80 bg-background hover:bg-muted text-foreground transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* ---------------- MAIN SECTION ---------------- */}
      <main className="flex-1 relative overflow-hidden py-12 md:py-20 flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-4 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Info & Branding */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Espace de Connexion Sécurisé
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Bienvenue sur <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Academia E-Learning
              </span>
            </h1>

            <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
              Connectez-vous pour accéder à vos cours, participer aux quiz en ligne, déposer vos devoirs et suivre vos résultats académiques.
            </p>

            {/* Feature list matching landing page */}
            <div className="space-y-4 pt-2 w-full max-w-md">
              <div className="p-4 rounded-2xl bg-card border border-border/70 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Espace Étudiant</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Cours interactifs, devoirs en ligne et relevés de notes.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Espace Enseignant</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Gestion des programmes, création de quiz et notation.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Administration</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Arborescence LMD, gestion des utilisateurs et promotions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="rounded-3xl bg-card border border-border/80 p-8 shadow-2xl shadow-primary/10 transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Connexion</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Saisissez vos identifiants académiques pour continuer
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Champ Email */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="exemple@univ.edu"
                      disabled={loading}
                      {...register("email")}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.email ? "border-rose-500 focus:ring-rose-500/20" : "border-border/80"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Champ Mot de passe */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-foreground">
                      Mot de passe
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={loading}
                      {...register("password")}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.password ? "border-rose-500 focus:ring-rose-500/20" : "border-border/80"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Bouton de Soumission Custom */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Credentials hint */}
              <div className="mt-6 pt-6 border-t border-border/60 text-center">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Plateforme sécurisée • Academia E-Learning System
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Academia E-Learning</span>
            <span>© {new Date().getFullYear()} Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>•</span>
            <span>Support & Aide</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
