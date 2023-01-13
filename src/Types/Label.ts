export interface Label {
  name: string;
  color: number;
  predefinedId: number;
  deleted: boolean;
  chatIds: Set<string>
}
