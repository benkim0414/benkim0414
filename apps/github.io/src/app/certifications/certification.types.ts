export interface CertificationMetadata {
  readonly id: string;
  readonly name: string;
  readonly completedAt: string;
}

export interface CertificationRecord {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly skills: readonly string[];
  readonly expiresAt: string;
  readonly citationIcon?: string;
  readonly metadata?: CertificationMetadata;
}
