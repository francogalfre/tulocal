type AdminMetricProps = {
  label: string;
  value: string;
};

export function AdminMetric({ label, value }: AdminMetricProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-secondary px-6 py-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="numeric font-heading text-3xl font-semibold">{value}</p>
    </div>
  );
}
