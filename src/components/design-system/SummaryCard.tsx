import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function SummaryCard({ title, value, subtitle, actions }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
        {subtitle ? <p className="text-sm text-text-secondary">{subtitle}</p> : null}
        {actions ? <div className="flex flex-wrap items-center gap-2 pt-2">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}
