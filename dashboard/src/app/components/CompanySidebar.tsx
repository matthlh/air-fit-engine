import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, AlertTriangle, X } from 'lucide-react';
import type { Company } from '../types';

function safeRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : formatDistanceToNow(d, { addSuffix: true });
}

interface CompanySidebarProps {
  companies: Company[];
  selectedDomain: string | null;
  onSelectCompany: (domain: string) => void;
  onDeleteCompany: (domain: string) => void;
  analyzingDomains?: Set<string>;
}

export function CompanySidebar({
  companies,
  selectedDomain,
  onSelectCompany,
  onDeleteCompany,
  analyzingDomains = new Set(),
}: CompanySidebarProps) {
  return (
    <aside className="w-80 bg-white/40 backdrop-blur-md border-r border-gray-200/50 overflow-y-auto flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200/50">
        <div className="text-xs uppercase tracking-wider text-gray-600 font-semibold">
          {companies.length} {companies.length === 1 ? 'Company' : 'Companies'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {companies.map((company) => {
          const isSelected = selectedDomain === company.domain;
          const isAnalyzing = analyzingDomains.has(company.domain);
          return (
            <motion.button
              key={company.domain}
              onClick={() => onSelectCompany(company.domain)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full px-4 py-3.5 text-left transition-all relative group mb-2 rounded-xl ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/5 shadow-md shadow-blue-500/10'
                  : 'hover:bg-white/60 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
              )}

              {/* Delete button — visible on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCompany(company.domain);
                }}
                className="absolute top-2 right-2 p-1 rounded-md text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                aria-label={`Remove ${company.domain}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold truncate ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {company.domain}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {isAnalyzing
                      ? 'Analyzing…'
                      : company.error
                      ? 'Could not be analyzed'
                      : (company.llm_analysis?.persona_guess ?? '')}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isAnalyzing ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium min-w-[44px] justify-center">
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </span>
                  ) : company.error ? (
                    <span className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium min-w-[44px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <ScoreBadge score={company.fit_score} isSelected={isSelected} />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {safeRelativeDate(company.created_at)}
                </div>
                {!isAnalyzing && <ConfidenceBadge confidence={company.confidence} />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {companies.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-sm text-gray-500">No companies found</div>
        </div>
      )}
    </aside>
  );
}

function ScoreBadge({ score, isSelected }: { score: number; isSelected: boolean }) {
  let colorClass = 'bg-gray-100 text-gray-700';
  if (score >= 70) {
    colorClass = isSelected
      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
      : 'bg-gradient-to-br from-green-100 to-emerald-50 text-green-700';
  } else if (score >= 40) {
    colorClass = isSelected
      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
      : 'bg-gradient-to-br from-yellow-100 to-orange-50 text-yellow-700';
  } else if (score > 0) {
    colorClass = isSelected
      ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
      : 'bg-gradient-to-br from-red-100 to-rose-50 text-red-700';
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-bold ${colorClass} min-w-[44px]`}
    >
      {score}
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  let colorClass = 'bg-gray-100/80 text-gray-600';
  if (confidence === 'high') colorClass = 'bg-blue-100/80 text-blue-700';
  else if (confidence === 'medium') colorClass = 'bg-purple-100/80 text-purple-700';

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${colorClass}`}>
      {confidence}
    </span>
  );
}
