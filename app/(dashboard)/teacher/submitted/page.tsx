import Header from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Inbox } from "lucide-react";

export default function SubmittedAssignmentsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Header
        title="Devoirs & TP soumis"
        description="Consultez et évaluez les devoirs et travaux pratiques remis par vos étudiants."
      />

      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Soumissions récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Inbox className="w-12 h-12 mb-3 text-muted-foreground/60" />
          <h3 className="text-lg font-medium text-foreground">Aucune soumission en attente</h3>
          <p className="text-sm max-w-sm mt-1">
            Les travaux soumis par les étudiants apparaîtront ici pour correction et notation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
