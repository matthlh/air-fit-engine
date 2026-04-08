export interface Company {
  domain: string;
  fit_score: number;
  confidence: 'high' | 'medium' | 'low';
  persona_guess: string;
  analyzed_at: string;
  reason_summary: string;
  score_breakdown?: {
    creative_ops_signals?: number;
    workflow_complexity?: number;
    hiring_signals?: number;
    tooling_overlap?: number;
    content_scale?: number;
  };
  signals: string[];
  careers_url: string;
  ats_provider: string | null;
  claude_reasoning?: string;
  outreach_angle?: string;
  evidence?: {
    source: string;
    snippet: string;
  }[];
}
