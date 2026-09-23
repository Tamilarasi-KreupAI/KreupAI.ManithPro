import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Company {
  companyName: string;
  companyDescription?: string | null;
  companyWebsite?: string | null;
  companyLogo?: string | null;
  companySize?: string | null;
  companyIndustry?: string | null;
  jobCount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const loadCompanies = async (currentPage = page, currentSearch = search) => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/companies', {
        params: {
          page: currentPage,
          limit: 20,
          ...(currentSearch.trim()
            ? { search: currentSearch.trim() }
            : {}),
        },
      });

      setCompanies(response.data.companies || []);

      setPagination(
        response.data.pagination || {
          total: 0,
          page: currentPage,
          limit: 20,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error('Failed to load companies:', err);
      setCompanies([]);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCompanies(page, search);
    }, 500);

    return () => clearTimeout(timer);
  }, [page, search]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Company Directory
          </h1>

          <p className="mt-2 text-gray-600">
            Explore companies and discover available job opportunities.
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-600">
            Loading companies...
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
            <p>{error}</p>

            <button
              onClick={() => loadCompanies(page, search)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center text-gray-600">
            No companies found.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <Link
                  key={company.companyName}
                  to={`/companies/${encodeURIComponent(company.companyName)}`}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-4">
                    {company.companyLogo ? (
                      <img
                        src={company.companyLogo}
                        alt={company.companyName}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200 text-xl font-bold text-gray-600">
                        {company.companyName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {company.companyName}
                      </h2>

                      {company.companyIndustry && (
                        <p className="text-sm text-gray-500">
                          {company.companyIndustry}
                        </p>
                      )}
                    </div>
                  </div>

                  {company.companyDescription && (
                    <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                      {company.companyDescription}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {company.jobCount}{' '}
                      {company.jobCount === 1 ? 'Job' : 'Jobs'}
                    </span>

                    {company.companySize && (
                      <span>{company.companySize}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Companies;