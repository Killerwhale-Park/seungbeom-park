type CvPrintHeaderProps = {
  name: string;
  title: string;
  affiliation: string;
  location: string;
  email: string;
  lastUpdated: string;
};

export function CvPrintHeader({
  name,
  title,
  affiliation,
  location,
  email,
  lastUpdated,
}: CvPrintHeaderProps) {
  return (
    <header className="cv-print-head" aria-hidden="true">
      <p className="cv-print-name font-display font-bold tracking-[-0.02em]">{name}</p>
      <p className="cv-print-line">{title}</p>
      <p className="cv-print-line">{affiliation}</p>
      <p className="cv-print-line">
        {location} / {email}
      </p>
      <p className="cv-print-meta font-mono">Last updated {lastUpdated}</p>
    </header>
  );
}
