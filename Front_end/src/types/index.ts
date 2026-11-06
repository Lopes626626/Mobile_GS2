export interface RiskEvent {
  id: number;
  type: string;
  location: string;
  source: string;
  confidenceLevel: number;
  priorityScore: number;
  timestamp?: string;
}