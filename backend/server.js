const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to parse GitHub URL
const parseGitHubUrl = (url) => {
  const match = url.match(/github\.com\/(.+?)\/(.+?)(?:\.git)?$/);
  return match ? { owner: match[1], repo: match[2] } : null;
};

// Main API endpoint
app.post('/api/repo-stats', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'GitHub URL is required' });
    }

    const { owner, repo } = parseGitHubUrl(url);
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }

    const commonHeaders = {
      'Accept': 'application/vnd.github.v3+json',
      'Cache-Control': 'no-cache'
    };

    if (process.env.GITHUB_TOKEN) {
      commonHeaders['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Get repository info
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoResponse = await fetch(repoUrl, { headers: commonHeaders });
    
    if (!repoResponse.ok) {
      return res.status(repoResponse.status).json({ 
        error: `GitHub API Error: ${repoResponse.statusText}` 
      });
    }

    const repoData = await repoResponse.json();

    // Get contributors
    const contributorsUrl = `${repoUrl}/contributors`;
    const contributorsResponse = await fetch(contributorsUrl, { headers: commonHeaders });
    const contributors = contributorsResponse.ok 
      ? await contributorsResponse.json() 
      : [];

    // Get commit activity
    const commitActivityUrl = `${repoUrl}/stats/commit_activity`;
    const commitActivityResponse = await fetch(commitActivityUrl, { headers: commonHeaders });
    let commitActivity = [];
    if (commitActivityResponse.status === 200) {
      const activityData = await commitActivityResponse.json();
      if (Array.isArray(activityData)) {
        commitActivity = activityData;
      }
    } else if (commitActivityResponse.status === 202) {
      console.log(`Commit activity for ${owner}/${repo} is being computed by GitHub (202 Accepted). Returning empty array for now.`);
    } else if (commitActivityResponse.status === 204) {
      console.log(`Commit activity for ${owner}/${repo} has no content (204 No Content). Returning empty array.`);
    } else if (!commitActivityResponse.ok) {
      // For other non-ok statuses, log an error but still return empty array to prevent frontend crash
      console.error(`GitHub API error for commit activity ${owner}/${repo}: ${commitActivityResponse.status} ${commitActivityResponse.statusText}`);
    }

    // Calculate average commit frequency
    const totalCommits = contributors.reduce((acc, curr) => acc + curr.contributions, 0);
    const averageCommits = totalCommits / contributors.length || 0;

    res.json({
      repo: {
        name: repoData.name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        watchers: repoData.watchers_count,
        lastPush: repoData.pushed_at
      },
      contributors,
      commitActivity,
      stats: {
        totalContributors: contributors.length,
        totalCommits,
        averageCommits: averageCommits.toFixed(1)
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
