import { GitHubUserData, GitHubRepoData } from './roastEngine';

export interface Badge {
  id: string;
  label: string;
  emoji: string;
}

const COMMIT_SPAM_PATTERNS = /^(fix|typo fix|final|final v2|final final v2|wip|update|fix bug|minor fix)\.?$/i;

export function generateBadges(
  user: GitHubUserData,
  repos: GitHubRepoData[],
  recentCommitMessages: string[] = []
): Badge[] {
  const badges: Badge[] = [];
  const safeRepos = Array.isArray(repos) ? repos : [];
  const totalStars = safeRepos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const languages = safeRepos.map((r) => r.language).filter(Boolean) as string[];
  const sixMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 182;
  const allStale = safeRepos.length > 0 && safeRepos.every((r) => new Date(r.pushed_at).getTime() < sixMonthsAgo);
  const claimsActive = !!user.bio && /active|full[\s-]?stack/i.test(user.bio);

  if (safeRepos.length > 10 && totalStars === 0 && user.followers <= 1) {
    badges.push({ id: 'lone-wolf', label: 'The Lone Wolf', emoji: '🐺' });
  }

  if (languages.length >= 3) {
    const webCount = languages.filter((l) => l === 'CSS' || l === 'HTML').length;
    if (webCount / languages.length > 0.7) {
      badges.push({ id: 'centering-div', label: 'The Centering Div Specialist', emoji: '📐' });
    }
  }

  if (allStale && claimsActive) {
    badges.push({ id: 'ghost-committer', label: 'The Ghost Committer', emoji: '👻' });
  }

  if (recentCommitMessages.length > 0) {
    const spamCount = recentCommitMessages.filter((m) => COMMIT_SPAM_PATTERNS.test(m.trim())).length;
    if (spamCount >= 2) {
      badges.push({ id: 'commit-spammer', label: 'The Commit Spammer', emoji: '🌀' });
    }
  }

  return badges;
}

export async function fetchRecentCommitMessages(
  username: string,
  repos: GitHubRepoData[],
  maxRepos = 3
): Promise<string[]> {
  const targets = [...repos]
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, maxRepos);

  const results = await Promise.allSettled(
    targets.map(async (r) => {
      const res = await fetch(`https://api.github.com/repos/${username}/${r.name}/commits?per_page=5`);
      if (!res.ok) return [];
      const commits = await res.json();
      if (!Array.isArray(commits)) return [];
      return commits.map((c: any) => c?.commit?.message || '').filter(Boolean);
    })
  );

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}