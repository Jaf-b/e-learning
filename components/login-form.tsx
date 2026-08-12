"use client"
import { Controller, useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Field, FieldError, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import z from "zod";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Loging } from "@/lib/action/authentication.actions";
import { toast } from "@/components/ui/toast";

const loginSchema = z.object({
    email: z.string().email("Veuillez entrer une adresse email valide."),
    password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<LoginFormValues>({
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
                    title: "Échec de la connexion",
                    description: result.error || "Identifiants invalides. Veuillez réessayer.",
                    type: "error",
                });
                setLoading(false);
                return;
            }

            toast.add({
                title: "Connexion réussie",
                description: "Bienvenue ! Redirection en cours...",
                type: "success",
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
                title: "Erreur inattendue",
                description: "Une erreur s'est produite. Veuillez réessayer.",
                type: "error",
            });
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
                    <CardDescription className="text-center">
                        Entrez vos identifiants pour accéder à votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* Champ Email */}
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} >
                                    <FieldLabel className="text-sm font-medium text-gray-700">
                                        Email
                                    </FieldLabel>
                                    <Input type="email" placeholder="nom@exemple.com" disabled={loading} {...field} />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Champ Mot de passe */}
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} >
                                    <FieldLabel className="text-sm font-medium text-gray-700">
                                        Mot de passe
                                    </FieldLabel>
                                    <Input type="password" placeholder="••••••••" disabled={loading} {...field} />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connexion en cours...
                                </>
                            ) : (
                                "Se connecter"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginForm
