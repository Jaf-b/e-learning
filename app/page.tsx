import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  FileText,
  BarChart3,
  ChevronRight,
  Building2,
  Lock,
  Zap,
  UserCheck,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* ---------------- NAVBAR ---------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight leading-none">Academia</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Portail E-Learning</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors duration-150">
              Fonctionnalités
            </a>
            <a href="#portals" className="hover:text-primary transition-colors duration-150">
              Portails & Rôles
            </a>
            <a href="#structure" className="hover:text-primary transition-colors duration-150">
              Système LMD
            </a>
            <a href="#stats" className="hover:text-primary transition-colors duration-150">
              Chiffres clés
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold border border-border/80 bg-background hover:bg-muted text-foreground transition-all duration-200"
            >
              Se connecter
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]"
            >
              Accéder au portail
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ---------------- HERO SECTION ---------------- */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="container max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col items-center text-center">
            {/* Custom Tailwind Pill Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Plateforme Numérique d'Enseignement Supérieur
            </span>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl leading-[1.1]">
              L'Excellence Académique <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                à Portée de Clic
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
              Une solution unifiée et moderne pour la gestion des cours, le suivi des promotions LMD, la réalisation de quiz interactifs et la consultation instantanée des relevés de notes.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-base shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5"
              >
                Espace Connexion
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#portals"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-border/80 bg-background hover:bg-muted font-medium text-base transition-all duration-200 hover:-translate-y-0.5"
              >
                Découvrir les espaces
              </a>
            </div>

            {/* Stats Grid */}
            <div id="stats" className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
              {[
                { label: "Facultés & Filières", value: "12+", icon: Building2, color: "text-blue-500 bg-blue-500/10" },
                { label: "Cours & Modules", value: "150+", icon: BookOpen, color: "text-emerald-500 bg-emerald-500/10" },
                { label: "Étudiants Inscrits", value: "2,500+", icon: Users, color: "text-amber-500 bg-amber-500/10" },
                { label: "Taux de Réussite", value: "98.5%", icon: Award, color: "text-purple-500 bg-purple-500/10" },
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col items-center justify-center text-center transition-transform duration-200 hover:-translate-y-1">
                  <div className={`p-3 rounded-2xl mb-3 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">{stat.value}</span>
                  <span className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- PORTALS & ROLES SECTION ---------------- */}
        <section id="portals" className="py-20 md:py-28 bg-muted/30 border-y border-border/50">
          <div className="container max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground mb-3">
                Des Espaces Dédiés
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Une expérience adaptée à chaque acteur académique
              </h2>
              <p className="mt-3 text-muted-foreground text-base">
                Chaque profil bénéficie d'une interface sur-mesure conçue pour simplifier ses tâches quotidiennes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card Étudiant */}
              <div className="group rounded-3xl bg-card border border-border/80 p-8 shadow-xs hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 font-bold">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 mb-4">
                    Espace Étudiant
                  </span>
                  <h3 className="text-xl font-bold mb-3">Apprendre & Suivre sa Progression</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Accédez à l'ensemble de vos cours, téléchargez le matériel pédagogique, effectuez vos travaux pratiques et consultez vos notes en temps réel.
                  </p>
                  <ul className="space-y-3 text-xs text-muted-foreground font-medium mb-8">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      Lecteur de leçons interactif
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      Soumission de TP & Quiz en ligne
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      Relevé de notes dynamique par semestre
                    </li>
                  </ul>
                </div>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-between px-5 py-3 rounded-2xl border border-border/80 bg-background text-foreground text-xs font-semibold group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200"
                >
                  Se connecter comme Étudiant
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card Enseignant */}
              <div className="group rounded-3xl bg-card border border-border/80 p-8 shadow-xs hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 font-bold">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 mb-4">
                    Espace Enseignant
                  </span>
                  <h3 className="text-xl font-bold mb-3">Enseigner & Évaluer avec Précision</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Concevez vos programmes de cours, créez des évaluations personnalisées et attribuez les notes en toute simplicité.
                  </p>
                  <ul className="space-y-3 text-xs text-muted-foreground font-medium mb-8">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Gestionnaire de modules et leçons
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Générateur de quiz et devoirs
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Saisie et validation des notes de classe
                    </li>
                  </ul>
                </div>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-between px-5 py-3 rounded-2xl border border-border/80 bg-background text-foreground text-xs font-semibold group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-200"
                >
                  Se connecter comme Enseignant
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card Admin */}
              <div className="group rounded-3xl bg-card border border-border/80 p-8 shadow-xs hover:shadow-2xl hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6 font-bold">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200/60 mb-4">
                    Administration
                  </span>
                  <h3 className="text-xl font-bold mb-3">Piloter la Structure Académique</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Organisez l'arborescence des facultés, filières et promotions, gérez les inscriptions et supervisez les comptes utilisateurs.
                  </p>
                  <ul className="space-y-3 text-xs text-muted-foreground font-medium mb-8">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      Arborescence Facultés / Départements / Filières
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      Gestion des inscriptions étudiants & promotions
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      Tableau de bord statistique et audit
                    </li>
                  </ul>
                </div>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-between px-5 py-3 rounded-2xl border border-border/80 bg-background text-foreground text-xs font-semibold group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-200"
                >
                  Se connecter comme Admin
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- FEATURES & ADVANTAGES ---------------- */}
        <section id="features" className="py-20 md:py-28">
          <div className="container max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold border border-primary/20 bg-primary/10 text-primary mb-3">
                Points Forts
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Pensé pour l'efficacité et la clarté
              </h2>
              <p className="mt-3 text-muted-foreground text-base">
                Découvrez les fonctionnalités clés qui font d'Academia une plateforme pédagogique incontournable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Layers,
                  title: "Structure LMD Flexible",
                  desc: "Modélisation complète du système LMD : Diplômes, Niveaux (L1-M2), Années académiques et Promotions.",
                },
                {
                  icon: FileText,
                  title: "Quiz & TP En Ligne",
                  desc: "Évaluez les compétences grâce à des QCM, des questions ouvertes et des espaces de remise de devoirs.",
                },
                {
                  icon: BarChart3,
                  title: "Calcul Automatique des Moyennes",
                  desc: "Pondération personnalisée par matière, gestion des coefficients et édition des bulletins.",
                },
                {
                  icon: UserCheck,
                  title: "Gestion des Rôles Sécurisée",
                  desc: "Contrôle d'accès granulaire basé sur le statut des utilisateurs (Admin, Enseignant, Étudiant).",
                },
                {
                  icon: Zap,
                  title: "Mises à jour Instantanées",
                  desc: "Consultez immédiatement les annonces, la publication des leçons et les nouvelles notes.",
                },
                {
                  icon: Lock,
                  title: "Sécurité & Confidentialité",
                  desc: "Cryptage des données de session, protection des comptes et authentification sécurisée.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col items-start"
                >
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- CTA BANNER ---------------- */}
        <section className="py-20 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="container max-w-5xl mx-auto px-4 sm:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Prêt à commencer l'aventure académique ?
            </h2>
            <p className="text-primary-foreground/85 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal">
              Connectez-vous dès maintenant pour accéder à vos cours, participer aux évaluations ou gérer votre établissement.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full bg-background text-foreground font-bold text-base shadow-2xl hover:bg-muted transition-all duration-200 hover:scale-105"
            >
              Se connecter maintenant
              <ArrowRight className="w-5 h-5 text-primary" />
            </Link>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-foreground">Academia E-Learning</span>
            <span>© {new Date().getFullYear()} Tous droits réservés.</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Connexion
            </Link>
            <a href="#features" className="hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#portals" className="hover:text-foreground transition-colors">
              Espaces Rôles
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
