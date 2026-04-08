export interface Signal {
  label: string;
  matched_keyword: string;
  snippet: string;
  source: string; // 'homepage' | 'careers'
  category: string;
}

export interface LlmAnalysis {
  fit_score_explanation: string;
  pain_signals: string[];
  persona_guess: string;
  confidence: 'high' | 'medium' | 'low';
  outreach_angle?: string;
}

export interface Company {
  id?: number;
  domain: string;
  error?: string; // set when the pipeline failed for this domain
  homepage_url?: string | null;
  careers_url?: string | null;
  title?: string | null;
  meta_description?: string | null;
  fit_score: number;
  confidence: 'high' | 'medium' | 'low';
  signal_categories: string[];
  creative_roles_detected: string[];
  score_breakdown: Record<string, number>;
  signals: Signal[];
  llm_analysis?: LlmAnalysis | null;
  created_at: string;
}
