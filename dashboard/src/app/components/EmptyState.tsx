import { FileSearch, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  hasCompanies: boolean;
  hasFilteredCompanies: boolean;
  isLoading?: boolean;
  error?: string | null;
  onAddCompany: () => void;
}

export function EmptyState({
  hasCompanies,
  hasFilteredCompanies,
  isLoading,
  error,
  onAddCompany,
}: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend unavailable</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasCompanies) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies yet</h3>
          <p className="text-sm text-gray-600 mb-6">
            Add a company URL or upload a CSV to get started with fit analysis.
          </p>
          <Button onClick={onAddCompany}>
            <Sparkles className="w-4 h-4" />
            Analyze Companies
          </Button>
        </div>
      </div>
    );
  }

  if (!hasFilteredCompanies) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No matching companies
          </h3>
          <p className="text-sm text-gray-600">
            Try adjusting your search or filters to see more results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSearch className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select a company
        </h3>
        <p className="text-sm text-gray-600">
          Choose a company from the sidebar to view its fit analysis.
        </p>
      </div>
    </div>
  );
}