declare interface AdditionalMediaInfo {
  call_to_actions?: CallToActions | null;
  description?: string | null;
  embeddable?: boolean | null;
  monetizable: boolean;
  source_user?: User | null;
  title?: string | null;
}
