import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
      <CardHeader className="pb-2 sm:pb-3 border-b border-red-400/20">
        <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-400">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-5">
        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-red-400">{value}</p>
        <p className="mt-2 text-xs sm:text-sm text-red-400/60 font-mono uppercase tracking-wide">{hint}</p>
      </CardContent>
    </Card>
  );
}
