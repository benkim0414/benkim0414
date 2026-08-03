export interface ProjectSkill {
  label: string;
  brandLabel?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  skills: readonly ProjectSkill[];
  githubUrl: string;
  evidenceIds?: readonly string[];
  capabilityKeys?: readonly string[];
}
