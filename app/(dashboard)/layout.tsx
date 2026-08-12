import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import SidebarComponent from "@/components/shared/sidebarComponent";

export default function Layout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <div>
            <SidebarProvider>
                <SidebarComponent/>
                <main>
                    <SidebarTrigger />
                    {children}
                </main>
            </SidebarProvider>
        </div>
    )
}

