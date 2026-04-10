import { DashboardNav } from "@/components/DashboardNav";
import { DashboardFooter } from "@/components/DashboardFooter";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <DashboardNav />
      {children}
      <DashboardFooter />
    </div>
  );
}
