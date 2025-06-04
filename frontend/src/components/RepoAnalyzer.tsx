import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; // Ensures all controllers, elements, scales, and plugins are registered
import axios from 'axios';

interface RepoData {
  repo: {
    name: string;
    description: string;
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    lastPush: string;
  };
  contributors: Array<{
    login: string;
    avatar_url: string;
    contributions: number;
  }>;
  commitActivity: Array<{
    total: number;
    week: number; // Unix timestamp
    days: number[];
  }>;
  stats: {
    totalContributors: number;
    totalCommits: number;
    averageCommits: string;
  };
}

const RepoAnalyzer: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchRepoData = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setRepoData(null);

      const response = await axios.post<RepoData>('http://localhost:5000/api/repo-stats', { url: repoUrl });
      setRepoData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch repository data. Check the URL or API rate limits.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCommitActivityChart = () => {
    if (!repoData?.commitActivity || !Array.isArray(repoData.commitActivity) || repoData.commitActivity.length === 0) {
      if (repoData?.commitActivity && !Array.isArray(repoData.commitActivity)) {
        // This case means commitActivity exists but is not an array (e.g., { message: "..." } from backend)
        console.warn("Commit activity data is not in the expected array format:", repoData.commitActivity);
        return (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Commit Activity (Last Year)</h3>
            <p className="text-center text-gray-600 py-4">
              Commit activity data is currently being processed or is unavailable. Please try again in a moment.
            </p>
          </div>
        );
      }
      // This case means commitActivity is null, undefined, or an empty array (no data to display).
      return null; 
    }

    // Ensure weekly data is an array of numbers
    const weeklyData = repoData.commitActivity.map(week => week.total || 0);
    const labels = repoData.commitActivity.map((_, i) => `Week ${i + 1}`);

    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Commit Activity (Last Year)</h3>
        <div style={{ height: '300px' }}>
          <Line
            data={{
              labels,
              datasets: [{
                label: 'Commits per Week',
                data: weeklyData,
                borderColor: 'rgb(59, 130, 246)', // blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.1,
                fill: true,
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: '#4B5563', // gray-600
                  },
                  grid: {
                    color: '#E5E7EB', // gray-200
                  }
                },
                x: {
                  ticks: {
                    color: '#4B5563',
                  },
                  grid: {
                    color: '#E5E7EB',
                  }
                }
              },
              plugins: {
                legend: {
                  labels: {
                    color: '#1F2937', // gray-800
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  const getContributorsList = () => {
    if (!repoData?.contributors || repoData.contributors.length === 0) return null;

    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Top Contributors</h3>
        <ul className="space-y-3 max-h-96 overflow-y-auto">
          {repoData.contributors.slice(0, 10).map((contributor, index) => (
            <li key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
              <img 
                src={contributor.avatar_url}
                alt={`${contributor.login}'s avatar`}
                className="w-10 h-10 rounded-full border-2 border-gray-200"
              />
              <div>
                <p className="font-medium text-gray-800">{contributor.login}</p>
                <p className="text-sm text-blue-600">{contributor.contributions} commits</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">GitHub Repository Analyzer</h1>
        <p className="text-lg text-gray-600 mt-2">Get key insights from public GitHub repositories.</p>
      </header>
      
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="e.g., https://github.com/facebook/react"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          <button
            onClick={fetchRepoData}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Fetch Insights'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-10">
          <div className="animate-pulse text-blue-600 font-semibold">Loading repository data...</div>
        </div>
      )}

      {repoData && !loading && (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Repository Details</h2>
            <div className="space-y-3">
              <p className="text-xl font-bold text-blue-700">{repoData.repo.name}</p>
              <p className="text-gray-600 italic">{repoData.repo.description || 'No description provided.'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-sm">
                {[{
                  label: 'Stars',
                  value: repoData.repo.stars.toLocaleString()
                }, {
                  label: 'Forks',
                  value: repoData.repo.forks.toLocaleString()
                }, {
                  label: 'Open Issues',
                  value: repoData.repo.openIssues.toLocaleString()
                }, {
                  label: 'Watchers',
                  value: repoData.repo.watchers.toLocaleString()
                }, {
                  label: 'Last Push',
                  value: new Date(repoData.repo.lastPush).toLocaleDateString()
                }].map(item => (
                  <div key={item.label} className="p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-500 font-medium">{item.label}</p>
                    <p className="font-semibold text-gray-800 text-lg">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Overall Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-indigo-50 rounded-md">
                <p className="text-indigo-500 font-medium">Total Contributors</p>
                <p className="font-bold text-indigo-700 text-2xl">{repoData.stats.totalContributors.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-md">
                <p className="text-green-500 font-medium">Total Commits</p>
                <p className="font-bold text-green-700 text-2xl">{repoData.stats.totalCommits.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-md">
                <p className="text-yellow-500 font-medium">Avg. Commits/Contributor</p>
                <p className="font-bold text-yellow-700 text-2xl">{repoData.stats.averageCommits}</p>
              </div>
            </div>
          </section>

          {getContributorsList()}
          {getCommitActivityChart()}
        </div>
      )}
    </div>
  );
};

export default RepoAnalyzer;
