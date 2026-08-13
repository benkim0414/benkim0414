export type GlobalSearchGroup = string;

export interface GlobalSearchResult {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly group: GlobalSearchGroup;
  readonly keywords: readonly string[];
}
