import { useState, useMemo, useEffect } from 'react';
import { ControlBar } from './components/ControlBar';
import { CompanySidebar } from './components/CompanySidebar';
import { CompanyDetail } from './components/CompanyDetail';
import { EmptyState } from './components/EmptyState';
import { AnalyzeDialog } from './components/AnalyzeDialog';
import type { Company } from './types';
import { api } from './api/client';

export default function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .listCompanies()
      .then(setCompanies)
      .catch(() => {
        // Backend unavailable — fall through to empty state
      })
      .finally(() => setIsLoading(false));
  }, []);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(
    companies.length > 0 ? companies[0].domain : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score-desc');
  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false);

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.domain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Score filter
    if (scoreFilter !== 'all') {
      if (scoreFilter === 'high') {
        filtered = filtered.filter((c) => c.fit_score >= 70);
      } else if (scoreFilter === 'medium') {
        filtered = filtered.filter((c) => c.fit_score >= 40 && c.fit_score < 70);
      } else if (scoreFilter === 'low') {
        filtered = filtered.filter((c) => c.fit_score < 40);
      }
    }

    // Sort
    if (sortBy === 'score-desc') {
      filtered = [...filtered].sort((a, b) => b.fit_score - a.fit_score);
    } else if (sortBy === 'score-asc') {
      filtered = [...filtered].sort((a, b) => a.fit_score - b.fit_score);
    } else if (sortBy === 'domain-asc') {
      filtered = [...filtered].sort((a, b) => a.domain.localeCompare(b.domain));
    } else if (sortBy === 'date-desc') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.analyzed_at).getTime() - new Date(a.analyzed_at).getTime()
      );
    }

    return filtered;
  }, [companies, searchQuery, scoreFilter, sortBy]);

  const selectedCompany = companies.find((c) => c.domain === selectedDomain);

  const handleAddCompanies = async (domains: string[], file?: File) => {
    let allDomains = domains;

    if (file) {
      const text = await file.text();
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      // Support "domain" header or bare list
      const start = lines[0]?.toLowerCase() === 'domain' ? 1 : 0;
      allDomains = lines.slice(start);
    }

    if (allDomains.length === 0) return;

    // Optimistic placeholders
    const placeholders: Company[] = allDomains.map((domain) => ({
      domain,
      fit_score: 0,
      confidence: 'low' as const,
      persona_guess: 'Analyzing…',
      analyzed_at: new Date().toISOString(),
      reason_summary: 'Analysis in progress…',
      signals: [],
      careers_url: '',
      ats_provider: null,
    }));
    setCompanies((prev) => [...placeholders, ...prev]);
    setSelectedDomain(placeholders[0].domain);

    try {
      const results = await api.analyze(allDomains);
      setCompanies((prev) => {
        const map = new Map(results.map((r) => [r.domain, r]));
        return prev.map((c) => map.get(c.domain) ?? c);
      });
    } catch {
      // Leave placeholders in place; user can retry
    }
  };

  const handleExportCSV = () => {
    window.open(api.exportCsvUrl(), '_blank');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <ControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        scoreFilter={scoreFilter}
        onScoreFilterChange={setScoreFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onAnalyze={() => setIsAnalyzeDialogOpen(true)}
        onExportCSV={handleExportCSV}
      />

      <div className="flex-1 flex overflow-hidden">
        <CompanySidebar
          companies={filteredCompanies}
          selectedDomain={selectedDomain}
          onSelectCompany={setSelectedDomain}
        />

        <main className="flex-1 overflow-auto">
          {selectedCompany ? (
            <CompanyDetail company={selectedCompany} />
          ) : (
            <EmptyState
              hasCompanies={companies.length > 0}
              hasFilteredCompanies={filteredCompanies.length > 0}
              isLoading={isLoading}
              onAddCompany={() => setIsAnalyzeDialogOpen(true)}
            />
          )}
        </main>
      </div>

      <AnalyzeDialog
        open={isAnalyzeDialogOpen}
        onOpenChange={setIsAnalyzeDialogOpen}
        onAnalyze={handleAddCompanies}
      />
    </div>
  );
}