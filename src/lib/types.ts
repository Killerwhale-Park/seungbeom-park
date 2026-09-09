export type ExternalRef = {
  label: string;
  url: string;
};

export type Profile = {
  name: string;
  title: string;
  affiliation: {
    department: string;
    institution: string;
    lab?: string;
    labUrl?: string;
  };
  location: string;
  email: string;
  photo?: string;
  greeting: {
    headline: string;
    paragraphs: string[];
  };
  interests: string[];
  links: {
    github?: string;
    googleScholar?: string;
    linkedin?: string;
    orcid?: string;
    blog?: string;
  };
  cvLastUpdated: string;
};

export type AuthorRef = {
  name: string;
  isSelf?: boolean;
  equalContribution?: boolean;
};

export type PublicationStatus =
  | "published"
  | "accepted"
  | "under-review"
  | "preprint"
  | "in-preparation";

export type PublicationType =
  | "conference"
  | "journal"
  | "workshop"
  | "preprint"
  | "thesis";

export type Publication = {
  id: string;
  title: string;
  anonymized?: boolean;
  note?: string;
  authors: AuthorRef[];
  venue: {
    name: string;
    abbreviation?: string;
    year: number;
  };
  type: PublicationType;
  status: PublicationStatus;
  abstract?: string;
  bibtex?: string;
  awards?: string[];
  links?: {
    pdf?: string;
    arxiv?: string;
    code?: string;
    slides?: string;
    poster?: string;
    video?: string;
    doi?: string;
  };
};

export type NewsTag = "publication" | "award" | "talk" | "service" | "misc";

export type NewsItem = {
  id: string;
  date: string;
  text: string;
  tag?: NewsTag;
  highlight?: boolean;
  link?: ExternalRef;
};

export type ProjectStatus = "active" | "completed" | "archived";

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string[];
  role?: string;
  period?: Period;
  stack: string[];
  highlights?: string[];
  links?: {
    github?: string;
    demo?: string;
    docs?: string;
  };
  status: ProjectStatus;
  featured?: boolean;
};

export type Period = {
  start: string;
  end?: string;
  expected?: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  period: Period;
  gpa?: {
    value: number;
    scale: number;
    major?: number;
  };
  thesis?: string;
  advisor?: string;
  notes?: string[];
};

export type AwardType = "scholarship" | "award" | "grant" | "fellowship";

export type Award = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  type: AwardType;
  amount?: string;
  description?: string;
};

export type ExperienceType = "research" | "industry" | "teaching" | "service";

export type Experience = {
  id: string;
  organization: string;
  role: string;
  period: Period;
  type: ExperienceType;
  url?: string;
  description: string[];
};

export type SkillGroup = {
  id: string;
  category: string;
  items: {
    name: string;
    note?: string;
  }[];
};

export type TestScore = {
  id: string;
  test: string;
  score: string;
  detail?: string;
  date: string;
  expiry?: string;
};
