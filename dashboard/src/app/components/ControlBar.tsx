import { Search, Sparkles, Download, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

interface ControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  scoreFilter: string;
  onScoreFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onAnalyze: () => void;
  onExportCSV: () => void;
}

export function ControlBar({
  searchQuery,
  onSearchChange,
  scoreFilter,
  onScoreFilterChange,
  sortBy,
  onSortChange,
  onAnalyze,
  onExportCSV,
}: ControlBarProps) {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 flex items-center gap-6 shadow-sm">
      <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        Air Fit Dashboard
      </h1>

      <div className="flex-1 flex items-center gap-3 max-w-3xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all shadow-sm"
          />
        </div>

        <select
          value={scoreFilter}
          onChange={(e) => onScoreFilterChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/60 backdrop-blur-sm shadow-sm transition-all"
        >
          <option value="all">All Scores</option>
          <option value="high">High (70+)</option>
          <option value="medium">Medium (40-69)</option>
          <option value="low">Low (&lt;40)</option>
        </select>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm border border-gray-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none bg-white/60 backdrop-blur-sm shadow-sm transition-all"
          >
            <option value="score-desc">Score: High to Low</option>
            <option value="score-asc">Score: Low to High</option>
            <option value="domain-asc">Domain: A-Z</option>
            <option value="date-desc">Recently Analyzed</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Button variant="secondary" size="sm" onClick={onExportCSV}>
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button variant="default" size="sm" onClick={onAnalyze}>
          <Sparkles className="w-4 h-4" />
          Analyze
        </Button>
      </div>
    </header>
  );
}