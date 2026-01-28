const axios = require('axios');

// Helper to get headers with token
const getGithubHeaders = () => {
    const token = process.env.GITHUB_TOKEN;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

exports.getRepoStats = async (req, res) => {
    const { owner, repo } = req.query;

    if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
    }

    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: getGithubHeaders()
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`GitHub API Error (Repo: ${owner}/${repo}):`, error.response?.status, error.message);
        if (error.response?.status === 404) return res.status(404).json({ error: 'Repository not found' });
        if (error.response?.status === 403) return res.status(403).json({ error: 'GitHub API Rate limit exceeded' });

        res.status(500).json({ error: 'Failed to fetch repository data' });
    }
};

exports.getContributors = async (req, res) => {
    const { owner, repo } = req.query;

    if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
    }

    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=12`, {
            headers: getGithubHeaders()
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`GitHub API Error (Contributors: ${owner}/${repo}):`, error.message);
        res.status(500).json({ error: 'Failed to fetch contributors' });
    }
};

exports.getPulls = async (req, res) => {
    const { owner, repo } = req.query;

    if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repo are required' });
    }

    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=5`, {
            headers: getGithubHeaders()
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`GitHub API Error (Pulls: ${owner}/${repo}):`, error.message);
        res.status(500).json({ error: 'Failed to fetch pull requests' });
    }
};
