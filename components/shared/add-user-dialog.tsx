"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/toast";
import { createUser, updateUser } from "@/lib/action/user.actions";
import { getFacultiesWithTree } from "@/lib/action/faculty.actions";
import { getAllDepartments } from "@/lib/action/departement.actions";
import { getAllFilieres } from "@/lib/action/filieres.actions";
import { getPromotions } from "@/lib/action/promotions.actions";
import { getAllDegrees, getAllDegreeLevels } from "@/lib/action/degree.actions";
import { getAcademicYears } from "@/lib/action/academic-years.actions";
import {
  User,
  Faculty,
  Department,
  Filiere,
  Promotion,
  Degree,
  DegreeLevel,
  AcademicYear,
} from "@/types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  UserPlus,
  Pencil,
  Mail,
  Lock,
  ShieldCheck,
  Building2,
  Layers,
  BookOpen,
  GraduationCap,
  Award,
  CalendarDays,
  Loader2,
} from "lucide-react";

// --- CACHE EN MÉMOIRE POUR ÉVITER LES REQUÊTES RÉPÉTÉES ---
interface DialogDataCache {
  faculties: Faculty[];
  departments: Department[];
  filieres: Filiere[];
  promotions: Promotion[];
  degrees: Degree[];
  degreeLevels: DegreeLevel[];
  academicYears: AcademicYear[];
  isLoaded: boolean;
}

const dataCache: DialogDataCache = {
  faculties: [],
  departments: [],
  filieres: [],
  promotions: [],
  degrees: [],
  degreeLevels: [],
  academicYears: [],
  isLoaded: false,
};

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Adresse email invalide." }),
  password: z.string().optional(),
  role: z.string(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  filiereId: z.string().optional(),
  promotionId: z.string().optional(),
  degreeId: z.string().optional(),
  degreeLevelId: z.string().optional(),
  academicYearId: z.string().optional(),
});

interface AddUserDialogProps {
  user?: User;
  children?: React.ReactNode;
  onSuccess?: (user?: any) => void;
}

export default function AddUserDialog({ user, children, onSuccess }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [options, setOptions] = useState<DialogDataCache>(dataCache);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "STUDENT",
      facultyId: "",
      departmentId: "",
      filiereId: "",
      promotionId: "",
      degreeId: "",
      degreeLevelId: "",
      academicYearId: "",
    },
  });

  const facultyId = form.watch("facultyId");
  const departmentId = form.watch("departmentId");
  const watchedRole = form.watch("role");

  // 1. LAZY LOADING : Charger les données uniquement quand la boîte de dialogue s'ouvre
  const loadSelectData = useCallback(async () => {
    if (dataCache.isLoaded) {
      setOptions(dataCache);
      return;
    }

    setLoadingData(true);
    try {
      const [
        facultiesRes,
        departmentsRes,
        filieresRes,
        promotionsRes,
        degreesRes,
        degreeLevelsRes,
        academicYearsRes,
      ] = await Promise.all([
        getFacultiesWithTree(),
        getAllDepartments(),
        getAllFilieres(),
        getPromotions(),
        getAllDegrees(),
        getAllDegreeLevels(),
        getAcademicYears(),
      ]);

      const fetchedData: DialogDataCache = {
        faculties: facultiesRes.success ? facultiesRes.data || [] : [],
        departments: departmentsRes.success ? departmentsRes.data || [] : [],
        filieres: filieresRes.success ? filieresRes.data || [] : [],
        promotions: promotionsRes.success ? promotionsRes.data || [] : [],
        degrees: degreesRes.success ? degreesRes.data || [] : [],
        degreeLevels: degreeLevelsRes.success ? degreeLevelsRes.data || [] : [],
        academicYears: academicYearsRes.success ? academicYearsRes.data || [] : [],
        isLoaded: true,
      };

      // Mettre à jour le cache et le state local
      Object.assign(dataCache, fetchedData);
      setOptions(fetchedData);
    } catch (error) {
      console.error("Erreur lors du chargement des sélecteurs:", error);
      toast.add({
        type: "error",
        description: "Erreur de chargement des options de formulaire.",
      });
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadSelectData();
    }
  }, [open, loadSelectData]);

  // 2. UTILISATION DE useMemo POUR LE FILTRAGE SANS DECLENCHER DE RE-RENDU PAR EFFET
  const filteredDepartments = useMemo(() => {
    if (!facultyId) return [];
    return options.departments.filter((d) => d.facultyId === facultyId);
  }, [facultyId, options.departments]);

  const filteredFilieres = useMemo(() => {
    if (!departmentId) return [];
    return options.filieres.filter((f) => f.departmentId === departmentId);
  }, [departmentId, options.filieres]);

  // Handlers pour réinitialiser les sélections dépendantes lors d'un changement utilisateur
  const handleFacultySelect = (value: string) => {
    form.setValue("facultyId", value);
    form.setValue("departmentId", "");
    form.setValue("filiereId", "");
  };

  const handleDepartmentSelect = (value: string) => {
    form.setValue("departmentId", value);
    form.setValue("filiereId", "");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const {
      facultyId,
      departmentId,
      filiereId,
      promotionId,
      degreeId,
      degreeLevelId,
      academicYearId,
      ...userData
    } = values;

    const userToSave: any = { ...userData, additionalFields: { role: values.role } };

    if (values.role === "STUDENT") {
      userToSave.enrollment = {
        promotionId: values.promotionId,
      };
    }

    setSubmitting(true);
    try {
      const response = user
          ? await updateUser(user.id, userToSave)
          : await createUser(JSON.stringify(userToSave));

      if (response.success) {
        toast.add({
          type: "success",
          description: user
              ? `Utilisateur "${values.name}" modifié avec succès.`
              : `Utilisateur "${values.name}" créé avec succès.`,
        });
        setOpen(false);
        form.reset();
        onSuccess?.(response.data);
      } else {
        toast.add({
          type: "error",
          description: response.error || "Une erreur est survenue lors de l'enregistrement.",
        });
      }
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err?.message || "Erreur lors de la communication avec le serveur.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!user;

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className={buttonVariants({ variant: "default", size: "lg" })}>
          {children || (
              <span className="flex items-center gap-2">
            {isEditing ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isEditing ? "Modifier" : "Ajouter un Utilisateur"}
          </span>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                {isEditing ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {isEditing ? "Modifier l'utilisateur" : "Nouvel Utilisateur"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isEditing
                      ? "Modifiez les informations du compte utilisateur."
                      : "Remplissez les informations pour créer un nouveau compte."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Form Body */}
          <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {loadingData ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Chargement des options...</p>
                  </div>
              ) : (
                  <>
                    {/* ── Informations Générales ── */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-4 h-px bg-border" />
                        Informations Générales
                        <span className="flex-1 h-px bg-border" />
                      </h4>

                      {/* Name */}
                      <Controller
                          name="name"
                          control={form.control}
                          render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                  <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
                                  Nom complet
                                </FieldLabel>
                                <Input placeholder="Jean Dupont" className="text-xs" {...field} />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                          )}
                      />

                      {/* Email */}
                      <Controller
                          name="email"
                          control={form.control}
                          render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                  Adresse Email
                                </FieldLabel>
                                <Input
                                    type="email"
                                    placeholder="jean.dupont@universite.cd"
                                    className="text-xs"
                                    {...field}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                          )}
                      />

                      {/* Password + Role in 2 cols */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Password */}
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                    Mot de passe
                                  </FieldLabel>
                                  <Input
                                      type="password"
                                      placeholder={isEditing ? "Laisser vide pour garder" : "••••••••"}
                                      className="text-xs"
                                      {...field}
                                  />
                                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        {/* Role */}
                        <Controller
                            name="role"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                                    Rôle
                                  </FieldLabel>
                                  <Select onValueChange={field.onChange}  defaultValue={field.value}>
                                    <SelectTrigger aria-invalid={fieldState.invalid} className="text-xs">
                                      <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectItem value="STUDENT">Étudiant</SelectItem>
                                        <SelectItem value="TEACHER">Enseignant</SelectItem>
                                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                      </div>
                    </div>

                    {/* ── Student Enrollment Section ── */}
                    {watchedRole === "STUDENT" && (
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <span className="w-4 h-px bg-border" />
                            Inscription Académique
                            <span className="flex-1 h-px bg-border" />
                          </h4>

                          {/* Faculty + Department */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="facultyId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        Faculté
                                      </FieldLabel>
                                      <Select
                                          onValueChange={(val) => {
                                            field.onChange(val);
                                            handleFacultySelect(val);
                                          }}
                                          value={field.value ?? ""}
                                      >
                                        <SelectTrigger aria-invalid={fieldState.invalid} className="text-xs">
                                          <SelectValue placeholder="Choisir une faculté" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            {options.faculties.map((faculty) => (
                                                <SelectItem key={faculty.id} value={faculty.id}>
                                                  {faculty.name}
                                                </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="departmentId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                        Département
                                      </FieldLabel>
                                      <Select
                                          onValueChange={(val) => {
                                            field.onChange(val);
                                            handleDepartmentSelect(val);
                                          }}
                                          value={field.value ??""}
                                          disabled={!facultyId}
                                      >
                                        <SelectTrigger aria-invalid={fieldState.invalid} className="text-xs">
                                          <SelectValue placeholder="Choisir un département" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            {filteredDepartments.map((department) => (
                                                <SelectItem key={department.id} value={department.id}>
                                                  {department.name}
                                                </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                          </div>

                          {/* Filiere + Promotion */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="filiereId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                        Filière
                                      </FieldLabel>
                                      <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          disabled={!departmentId}
                                      >
                                        <SelectTrigger aria-invalid={fieldState.invalid} className="text-xs">
                                          <SelectValue placeholder="Choisir une filière" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            {filteredFilieres.map((filiere) => (
                                                <SelectItem key={filiere.id} value={filiere.id}>
                                                  {filiere.name}
                                                </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="promotionId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                                        Promotion
                                      </FieldLabel>
                                      <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          disabled={!form.watch("filiereId")}
                                      >
                                        <SelectTrigger aria-invalid={fieldState.invalid} className="text-xs">
                                          <SelectValue placeholder="Choisir une promotion" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            {options.promotions.map((promotion) => (
                                                <SelectItem key={promotion.id} value={promotion.id}>
                                                  {promotion.code}
                                                </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                          </div>

                          {/* Degree + Degree Level */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="degreeId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-muted-foreground" />
                                        Diplôme
                                      </FieldLabel>
                                      <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          disabled={!form.watch("promotionId")}
                                      >
                                        <SelectTrigger aria-invalid={fieldState.invalid} className="text-xs">
                                          <SelectValue placeholder="Choisir un diplôme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            {options.degrees.map((degree) => (
                                                <SelectItem key={degree.id} value={degree.id}>
                                                  {degree.name}
                                                </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="degreeLevelId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                        Niveau
                                      </FieldLabel>
                                      <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          disabled={!form.watch("degreeId")}
                                      >
                                        <SelectTrigger aria-invalid={fieldState.invalid} className="text-xs">
                                          <SelectValue placeholder="Choisir un niveau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            {options.degreeLevels.map((level) => (
                                                <SelectItem key={level.id} value={level.id}>
                                                  {level.name}
                                                </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                          </div>

                          {/* Academic Year */}
                          <Controller
                              name="academicYearId"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                                      Année Académique
                                    </FieldLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!form.watch("promotionId")}
                                    >
                                      <SelectTrigger aria-invalid={fieldState.invalid} className="text-xs">
                                        <SelectValue placeholder="Choisir une année académique" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          {options.academicYears.map((year) => (
                                              <SelectItem key={year.id} value={year.id}>
                                                {year.year}
                                              </SelectItem>
                                              ))}
                                            </SelectGroup>
                                            </SelectContent>
                                            </Select>
                                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                  </Field>
                              )}
                          />
                        </div>
                    )}
                  </>
              )}
            </div>

            {/* Sticky Footer */}
            <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/30 shrink-0">
              <DialogClose
                  render={
                    <Button variant="outline" size="sm" className="text-xs" />
                  }
              >
                Annuler
              </DialogClose>
              <Button type="submit" size="sm" className="text-xs gap-1.5" disabled={submitting || loadingData}>
                {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {isEditing ? "Enregistrement..." : "Création en cours..."}
                    </>
                ) : isEditing ? (
                    <>
                      <Pencil className="w-3.5 h-3.5" />
                      Enregistrer les modifications
                    </>
                ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Créer l'utilisateur
                    </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}