import { ExternalLink, Clock, User, Briefcase, TrendingUp, CheckCircle2, Globe, Users } from 'lucide-react';
import { motion } from 'motion/react';
import type { Company } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface CompanyDetailProps {
  company: Company;
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  // Extract top 3 reasons from score breakdown
  const topReasons = company.score_breakdown
    ? Object.entries(company.score_breakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([key, value]) => ({
          key,
          value,
          label: key.replace(/_/g, ' '),
        }))
    : [];

  // Group evidence by source
  const evidenceBySource = {
    homepage: company.evidence?.filter((e) => e.source === 'homepage') || [],
    careers: company.evidence?.filter((e) => e.source === 'careers') || [],
    tooling: [] as typeof company.evidence,
  };

  return (
    <motion.div
      key={company.domain}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto p-8"
    >
      {/* Hero Section with Circular Score */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-8 mb-6 shadow-lg shadow-gray-200/50">
        <div className="flex items-start gap-8">
          {/* Left: Company Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              {company.domain}
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              {company.persona_guess && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{company.persona_guess}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Analyzed {formatDistanceToNow(new Date(company.analyzed_at), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Top Reasons */}
            {topReasons.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-900 mb-3">Top reasons for this score</div>
                <div className="space-y-2.5">
                  {topReasons.map((reason, idx) => (
                    <motion.div
                      key={reason.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2 bg-gradient-to-r from-green-50/50 to-emerald-50/30 px-3 py-2 rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <span className="font-medium capitalize">{reason.label}</span>
                        <span className="text-gray-600"> contributes </span>
                        <span className="font-semibold text-gray-900">{reason.value} points</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Circular Fit Score */}
          <div className="flex-shrink-0">
            <CircularScore score={company.fit_score} confidence={company.confidence} />
          </div>
        </div>

        {/* Reason Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200/50">
          <div className="text-sm font-medium text-gray-700 mb-2">Summary</div>
          <p className="text-sm text-gray-900 leading-relaxed">{company.reason_summary}</p>
        </div>
      </div>

      {/* Matched Signals */}
      {company.signals.length > 0 && (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 mb-6 shadow-lg shadow-gray-200/50">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Matched Signals</h3>
          <div className="flex flex-wrap gap-2">
            {company.signals.map((signal, idx) => (
              <motion.span
                key={signal}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-700 text-sm font-medium border border-blue-200/50 shadow-sm"
              >
                {signal}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Score Breakdown with Explanations */}
      {company.score_breakdown && (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 mb-6 shadow-lg shadow-gray-200/50">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Score Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(company.score_breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {getBreakdownExplanation(key)}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{value} pts</span>
                </div>
                <div className="h-2 bg-gray-100/80 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / 30) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Cards */}
      <div className="space-y-6">
        {/* Homepage Evidence */}
        {evidenceBySource.homepage.length > 0 && (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 shadow-lg shadow-gray-200/50">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Homepage Evidence
            </h3>
            <div className="space-y-3">
              {evidenceBySource.homepage.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-gray-50/80 to-blue-50/30 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm"
                >
                  <p className="text-sm text-gray-700 leading-relaxed italic">"{item.snippet}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Careers Evidence */}
        {(evidenceBySource.careers.length > 0 || company.careers_url) && (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 shadow-lg shadow-gray-200/50">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Careers & Hiring Signals
            </h3>
            <div className="space-y-4">
              {company.careers_url && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Careers Page</div>
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
              {evidenceBySource.careers.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-purple-50/80 to-pink-50/30 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 shadow-sm"
                >
                  <p className="text-sm text-gray-700 leading-relaxed italic">"{item.snippet}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tooling & ATS */}
        {company.ats_provider && (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-6 shadow-lg shadow-gray-200/50">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              Tooling & Infrastructure
            </h3>
            <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/30 backdrop-blur-sm rounded-xl p-4 border border-green-200/50 shadow-sm">
              <div className="text-xs text-green-700 uppercase tracking-wide mb-1 font-medium">ATS Provider Detected</div>
              <div className="text-sm text-gray-900 capitalize font-medium">{company.ats_provider}</div>
              <p className="text-xs text-gray-600 mt-1">
                Indicates structured hiring and potential creative ops team growth
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Claude Insights */}
      {(company.claude_reasoning || company.outreach_angle) && (
        <div className="bg-gradient-to-br from-blue-50/60 to-purple-50/40 backdrop-blur-md rounded-2xl border border-white/80 p-6 mt-6 shadow-lg shadow-blue-200/30">
          <h3 className="text-base font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-4">
            {company.claude_reasoning && (
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 font-medium">Analysis</div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {company.claude_reasoning}
                </p>
              </div>
            )}

            {company.outreach_angle && (
              <div className="pt-4 border-t border-blue-200/50">
                <div className="text-xs text-blue-700 uppercase tracking-wide mb-2 font-medium">Suggested Outreach</div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {company.outreach_angle}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CircularScore({ score, confidence }: { score: number; confidence: string }) {
  const percentage = score;
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r="54"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
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
  if (confidence === 'high') {
    colorClass = 'bg-blue-100 text-blue-700 border-blue-300';
  } else if (confidence === 'medium') {
    colorClass = 'bg-purple-100 text-purple-700 border-purple-300';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${colorClass} uppercase tracking-wide`}>
      {confidence} confidence
    </span>
  );
}

function getBreakdownExplanation(key: string): string {
  const explanations: Record<string, string> = {
    creative_ops_signals: 'Brand operations, asset management, workflow mentions',
    workflow_complexity: 'Cross-team coordination and review process indicators',
    hiring_signals: 'Creative, brand, or ops-related job postings',
    tooling_overlap: 'Design tools and creative software usage',
    content_scale: 'High volume content production evidence',
  };
  return explanations[key] || 'Contributes to overall fit assessment';
}