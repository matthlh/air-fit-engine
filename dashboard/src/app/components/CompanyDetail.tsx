import { useState } from 'react';
import {
  ExternalLink,
  Clock,
  User,
  TrendingUp,
  CheckCircle2,
  Globe,
  Users,
  Copy,
  Check,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import type { Company, Signal } from '../types';

function safeRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : formatDistanceToNow(d, { addSuffix: true });
}
import { api } from '../api/client';

// Max points per category — mirrors scoring_rubric.json
const SCORE_MAXIMA: Record<string, number> = {
  asset_management: 20,
  brand_creative_ops: 20,
  review_approvals: 15,
  content_operations: 15,
  versioning: 10,
  scale_localization: 10,
  creative_tooling: 10,
  team_collaboration: 5,
};

const CATEGORY_LABELS: Record<string, string> = {
  asset_management: 'Asset Management',
  brand_creative_ops: 'Brand & Creative Ops',
  review_approvals: 'Review & Approvals',
  content_operations: 'Content Operations',
  versioning: 'Versioning',
  scale_localization: 'Scale & Localization',
  creative_tooling: 'Creative Tooling',
  team_collaboration: 'Team Collaboration',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  asset_management: 'DAM, asset library, or media organization mentions',
  brand_creative_ops: 'Brand operations, creative workflow, or production ops signals',
  review_approvals: 'Approval flows, feedback loops, or sign-off process indicators',
  content_operations: 'Content production, publishing pipeline, or campaign ops signals',
  versioning: 'File versioning, revision history, or iteration management',
  scale_localization: 'High-volume production, localization, or multi-market content',
  creative_tooling: 'Design tools, creative software stack, or tooling mentions',
  team_collaboration: 'Cross-team coordination, shared workflows, or stakeholder alignment',
};

interface CompanyDetailProps {
  company: Company;
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  const [outreachCopied, setOutreachCopied] = useState(false);

  const breakdown = company.score_breakdown ?? {};
  const signals = company.signals ?? [];
  const llm = company.llm_analysis;

  // Top 3 scoring categories with their evidence snippet
  const topReasons = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, score]) => ({
      category,
      score,
      max: SCORE_MAXIMA[category] ?? 20,
      label: CATEGORY_LABELS[category] ?? category.replace(/_/g, ' '),
      evidence: signals.find((s) => s.category === category),
    }));

  // Signals grouped by source
  const homepageSignals = signals.filter((s) => s.source === 'homepage');
  const careersSignals = signals.filter((s) => s.source === 'careers');

  const copyOutreach = () => {
    const text = llm?.outreach_angle;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setOutreachCopied(true);
      setTimeout(() => setOutreachCopied(false), 2000);
    });
  };

  if (company.error) {
    return (
      <motion.div
        key={company.domain}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto p-8"
      >
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-red-200/60 p-8 shadow-lg">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{company.domain}</h2>
              <p className="text-sm font-medium text-red-600 mb-3">Could not be analyzed</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                The scraper was unable to fetch or process this site. This usually means the site
                blocks headless browsers, requires authentication, or the domain doesn't resolve.
              </p>
              {company.error && (
                <details className="mt-4">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                    Show error detail
                  </summary>
                  <pre className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                    {company.error}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={company.domain}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto p-8"
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-8 mb-6 shadow-lg shadow-gray-200/50">
        <div className="flex items-start gap-8">
          {/* Left: meta + top reasons */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 truncate">
              {company.domain}
            </h2>

            <div className="space-y-2 text-sm text-gray-600">
              {llm?.persona_guess && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{llm.persona_guess}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  Analyzed {safeRelativeDate(company.created_at)}
                </span>
              </div>
            </div>

            {topReasons.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-900 mb-3">Top reasons for this score</div>
                <div className="space-y-2.5">
                  {topReasons.map((reason, idx) => (
                    <motion.div
                      key={reason.category}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="bg-gradient-to-r from-green-50/50 to-emerald-50/30 px-3 py-2.5 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{reason.label}</span>
                        <span className="ml-auto text-sm font-semibold text-gray-900">
                          {reason.score}
                          <span className="text-gray-400 font-normal"> / {reason.max}</span>
                        </span>
                      </div>
                      {reason.evidence && (
                        <p className="text-xs text-gray-500 italic pl-6 leading-relaxed">
                          "{reason.evidence.snippet}"
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: circular score */}
          <div className="flex-shrink-0">
            <CircularScore score={company.fit_score} confidence={company.confidence} />
          </div>
        </div>

        {/* Summary */}
        {llm?.fit_score_explanation && (
          <div className="mt-6 pt-6 border-t border-gray-200/50">
            <div className="text-sm font-medium text-gray-700 mb-2">Summary</div>
            <p className="text-sm text-gray-900 leading-relaxed">{llm.fit_score_explanation}</p>
          </div>
        )}
      </div>

      {/* ── Matched Signals ──────────────────────────────────── */}
      {signals.length > 0 && (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 mb-6 shadow-lg shadow-gray-200/50">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Matched Signals</h3>
          <div className="flex flex-wrap gap-2">
            {signals.map((signal, idx) => (
              <motion.span
                key={`${signal.category}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                title={signal.snippet}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-700 text-sm font-medium border border-blue-200/50 shadow-sm cursor-default"
              >
                {signal.label}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* ── Score Breakdown ───────────────────────────────────── */}
      {Object.keys(breakdown).length > 0 && (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 mb-6 shadow-lg shadow-gray-200/50">
          <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Score Breakdown
          </h3>
          <div className="space-y-5">
            {Object.entries(breakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, score]) => {
                const max = SCORE_MAXIMA[category] ?? 20;
                const pct = Math.min((score / max) * 100, 100);
                const evidence = signals.find((s) => s.category === category);
                return (
                  <div key={category}>
                    <div className="flex items-start justify-between mb-1.5 gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {CATEGORY_DESCRIPTIONS[category] ?? ''}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                        {score}
                        <span className="text-gray-400 font-normal"> / {max}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100/80 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      />
                    </div>
                    {evidence && (
                      <p className="text-xs text-gray-500 italic mt-1.5 leading-relaxed">
                        "{evidence.snippet}"
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Evidence by Source ───────────────────────────────── */}
      <div className="space-y-6 mb-6">
        <EvidenceSection
          title="Homepage"
          icon={<Globe className="w-5 h-5 text-blue-600" />}
          signals={homepageSignals}
          cardClass="from-gray-50/80 to-blue-50/30 border-gray-200/50"
        />

        {(careersSignals.length > 0 || company.careers_url) && (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 shadow-lg shadow-gray-200/50">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Careers &amp; Hiring
            </h3>
            {company.careers_url && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Careers page</div>
                <a
                  href={company.careers_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group font-medium"
                >
                  {company.careers_url}
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            )}
            {careersSignals.length > 0 && (
              <div className="space-y-3">
                {careersSignals.map((sig, idx) => (
                  <SignalCard key={idx} signal={sig} cardClass="from-purple-50/80 to-pink-50/30 border-purple-200/50" />
                ))}
              </div>
            )}
            {company.creative_roles_detected?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200/50">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Creative roles detected
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.creative_roles_detected.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200/50"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── AI Insights ──────────────────────────────────────── */}
      {llm && (
        <div className="bg-gradient-to-br from-blue-50/60 to-purple-50/40 backdrop-blur-md rounded-2xl border border-white/80 p-6 mb-6 shadow-lg shadow-blue-200/30">
          <h3 className="text-base font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-4">
            {llm.pain_signals?.length > 0 && (
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 font-medium">
                  Pain signals
                </div>
                <ul className="space-y-1">
                  {llm.pain_signals.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">›</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {llm.outreach_angle && (
              <div className="pt-4 border-t border-blue-200/50">
                <div className="text-xs text-blue-700 uppercase tracking-wide mb-2 font-medium">
                  Suggested outreach angle
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{llm.outreach_angle}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Next Best Action ─────────────────────────────────── */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 shadow-lg shadow-gray-200/50">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Next Best Action
        </h3>
        <div className="flex flex-wrap gap-3">
          {llm?.outreach_angle && (
            <button
              onClick={copyOutreach}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              {outreachCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Outreach Snippet
                </>
              )}
            </button>
          )}
          <a
            href={api.exportCsvUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Account Profile
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function EvidenceSection({
  title,
  icon,
  signals,
  cardClass,
}: {
  title: string;
  icon: React.ReactNode;
  signals: Signal[];
  cardClass: string;
}) {
  if (signals.length === 0) return null;
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 shadow-lg shadow-gray-200/50">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">
        {signals.map((sig, idx) => (
          <SignalCard key={idx} signal={sig} cardClass={cardClass} />
        ))}
      </div>
    </div>
  );
}

function SignalCard({ signal, cardClass }: { signal: Signal; cardClass: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${cardClass} backdrop-blur-sm rounded-xl p-4 border shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {signal.label}
        </span>
        <span className="text-xs text-gray-400">· matched "{signal.matched_keyword}"</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed italic">"{signal.snippet}"</p>
    </motion.div>
  );
}

function CircularScore({ score, confidence }: { score: number; confidence: string }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = 'text-gray-600';
  let strokeColor = '#9ca3af';
  if (score >= 70) {
    scoreColor = 'text-green-600';
    strokeColor = '#16a34a';
  } else if (score >= 40) {
    scoreColor = 'text-yellow-600';
    strokeColor = '#ca8a04';
  } else if (score > 0) {
    scoreColor = 'text-red-600';
    strokeColor = '#dc2626';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="transform -rotate-90 w-36 h-36">
          <circle cx="72" cy="72" r="54" stroke="#e5e7eb" strokeWidth="12" fill="none" />
          <motion.circle
            cx="72"
            cy="72"
            r="54"
            stroke={strokeColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-4xl font-bold ${scoreColor}`}
          >
            {score}
          </motion.div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Fit Score</div>
        </div>
      </div>
      <div className="mt-3">
        <ConfidenceBadge confidence={confidence} />
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  let colorClass = 'bg-gray-100 text-gray-700 border-gray-300';
  if (confidence === 'high') colorClass = 'bg-blue-100 text-blue-700 border-blue-300';
  else if (confidence === 'medium') colorClass = 'bg-purple-100 text-purple-700 border-purple-300';

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${colorClass} uppercase tracking-wide`}
    >
      {confidence} confidence
    </span>
  );
}
