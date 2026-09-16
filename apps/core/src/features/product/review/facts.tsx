type FactsProps = {
  facts: string[];
};

export function Facts({ facts }: FactsProps) {
  if (facts.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg">Lo que investigamos del modelo</h2>
        <p className="text-sm text-muted-foreground">
          Tu vendedor lo usa para responder cosas generales. Lo de esta unidad te lo pregunta a vos.
        </p>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {facts.map((fact) => (
          <li key={fact} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-deep"
            />
            <span>{fact}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
