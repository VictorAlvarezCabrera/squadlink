export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-2 sm:space-y-3">
      <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/80">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">{title}</h2>
      <p className="text-sm leading-6 text-slate-300/78">{description}</p>
    </div>
  );
}
