"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  FileCheckCorner,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  Newspaper,
  PlusCircle,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "GUEST";

type User = {
  id?: string;
  name?: string;
  role?: Role;
};

interface SidebarProps {
  user?: User | null;
}

function getMenuForRole(role: Role) {
  const admin = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Users Management", href: "/admin/user-management", icon: <Users className="w-5 h-5" /> },
    { label: "Courses", href: "/admin/courses", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Academic Structure", href: "/admin/academic-structure", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Feedback", href: "/admin/feedback", icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const teacher = [
    { label: "Tableau de bord", href: "/teacher", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Mes Cours", href: "/teacher/courses", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Soumissions", href: "/teacher/submitted", icon: <FileCheckCorner className="w-5 h-5" /> },
  ];

  const student = [
    { label: "Tableau de bord", href: "/student", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Mes Cours", href: "/student/courses", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Mes TPs & Devoirs", href: "/student/assignement", icon: <FileCheckCorner className="w-5 h-5" /> },
    { label: "Quizz & Interros", href: "/student/quiz", icon: <Newspaper className="w-5 h-5" /> },
    { label: "Examens", href: "/student/exam", icon: <GraduationCap className="w-5 h-5" /> },
  ];

  const guest = [
    { label: "Browse Courses", href: "/courses", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Sign in", href: "/login", icon: <LogIn className="w-5 h-5" /> },
    { label: "Register", href: "/register", icon: <UserPlus className="w-5 h-5" /> },
  ];
  if (role === "ADMIN") return admin;
  if (role === "TEACHER") return teacher;
  if (role === "STUDENT") return student;
  return guest;
}

export default function SidebarComponent({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(user === undefined ? undefined : (user ?? null));
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Si 'user' est explicitement fourni comme prop (ex: null ou un objet), on ne fetch pas
    if (user !== undefined) return;

    let mounted = true;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");

        if (!res.ok) {
          if (mounted) setCurrentUser(null);
          return;
        }

        const data = await res.json();

        if (!mounted) return;

        const extractedUser = data?.user !== undefined ? data.user : (data ?? null);
        setCurrentUser(extractedUser);
      } catch (error) {
        if (mounted) setCurrentUser(null);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/login";
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const role: Role = (currentUser?.role as Role) ?? "GUEST";
  const menu = getMenuForRole(role);

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/teacher" || href === "/student") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar >
      <SidebarContent>
        <SidebarMenu>
          {menu.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton isActive={isActive(item.href)}>
                <Link href={item.href} className="flex gap-2 w-full">
                  {item.icon}
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t">
        {currentUser && role !== "GUEST" ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
              <span className="font-medium truncate max-w-[120px]">{currentUser.name || "Utilisateur"}</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">{role}</span>
            </div>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full flex items-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>
            </SidebarMenuButton>
          </div>
        ) : (
          <SidebarMenuButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full flex items-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
