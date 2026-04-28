import { Badge } from "@/components/ui/badge";

type StatusVariant = "success" | "warning" | "error" | "secondary";

interface StatusBadgeProps {
  label: string;
  status: StatusVariant;
}

export function StatusBadge({ label, status }: StatusBadgeProps) {
  return <Badge variant={status}>{label}</Badge>;
}
