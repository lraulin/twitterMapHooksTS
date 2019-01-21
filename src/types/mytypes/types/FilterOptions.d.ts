import { IncidentTypeChecked } from "./IncidentTypeChecked";

export interface FilterOptions {
  text: string;
  startDate: Date | null;
  endDate: Date | null;
  incidentTypes: IncidentTypeChecked;
}
