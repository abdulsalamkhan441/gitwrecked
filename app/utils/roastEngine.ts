export interface GitHubUserData {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

export interface GitHubRepoData {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

export type Severity = 1 | 2 | 3;
export type RoastIntensity = 'mild' | 'deep-fried';

export interface RoastPoint {
  id: string;
  fragment: string;  
  tip: string;
  severity: Severity;
}

export interface RoastReport {
  roastText: string;       
  points: RoastPoint[];  
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  uselessnessScore: number;
  accountAgeYears: number;
  totalStars: number;
  intensity: RoastIntensity;
}

function accountAgeInYears(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

function gradeFromScore(score: number): RoastReport['grade'] {
  if (score <= 0) return 'S';
  if (score <= 2) return 'A';
  if (score <= 4) return 'B';
  if (score <= 6) return 'C';
  if (score <= 8) return 'D';
  return 'F';
}

const BUZZWORDS = ['ninja', 'rockstar', 'guru', 'passionate developer', '10x'];
const GENERIC_REPO_NAMES = ['test', 'test1', 'test2', 'demo', 'my-app', 'myapp', 'untitled', 'new-project', 'project', 'temp', 'sandbox', 'hello-world'];

interface Rule {
  id: string;
  test: (ctx: RuleContext) => boolean;
  mild: (ctx: RuleContext) => string;
  fried: (ctx: RuleContext) => string;
  friedOnly?: boolean;
  tip: string;
  severity: Severity;
}

const CONNECTORS_MILD = [
  'Also,', 'And honestly,', 'Not gonna lie,', 'On top of that,', 'Then there\'s the part where',
  'Plus,', 'Meanwhile,', 'Not to mention,', 'And then there\'s the fact that',
];
const CONNECTORS_FRIED = [
  'AND another thing —', 'Not to mention,', 'Then we get to the part where', 'Also, side note,',
  'On top of all that,', 'And I\'m sorry but', 'Then there\'s this:', 'Oh, and', 'We also need to talk about how',
  'And just when you think it can\'t get worse,',
];

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

interface RuleContext {
  user: GitHubUserData;
  repos: GitHubRepoData[];
  originalRepos: GitHubRepoData[];
  forkedRepos: GitHubRepoData[];
  undocumented: GitHubRepoData[];
  staleRepos: GitHubRepoData[];
  languages: string[];
  totalStars: number;
  ageYears: number;
  bestRepo: GitHubRepoData | null;    
  staleFlagship: GitHubRepoData | null; 
  oldestStale: GitHubRepoData | null;   
  genericNamed: GitHubRepoData[];
}

function composeRoast(points: RoastPoint[], intensity: RoastIntensity, grade: string, login: string): string {
  const opener =
    intensity === 'deep-fried'
      ? pickN(
          [
            `I really did not have to open @${login}'s profile today, but we're here now so let's get into it.`,
            `Okay so I pulled up @${login}'s GitHub and immediately understood why nobody asked.`,
            `Sat down, opened @${login}'s profile, and the disrespect started immediately.`,
          ],
          1
        )[0]
      : pickN(
          [
            `Took a look at @${login}'s GitHub, and, well.`,
            `Pulled up @${login}'s profile. Here's what's going on.`,
            `Okay so @${login}'s GitHub says a lot, actually.`,
          ],
          1
        )[0];

  const sorted = [...points].sort((a, b) => b.severity - a.severity);
  const chosen = sorted.slice(0, Math.min(8, sorted.length));

  const connectors = intensity === 'deep-fried' ? CONNECTORS_FRIED : CONNECTORS_MILD;
  const usedConnectors = pickN(connectors, Math.max(0, chosen.length - 1));

  let body = chosen[0]?.fragment ?? '';
  for (let i = 1; i < chosen.length; i++) {
    body += ` ${usedConnectors[i - 1]} ${chosen[i].fragment}`;
  }

  const closer =
    intensity === 'deep-fried'
      ? pickN(
          [
            `Grade: ${grade}. Not a redemption arc in sight.`,
            `That's a ${grade}. Someone had to say it.`,
            `Verdict: ${grade}. Take the L and commit better.`,
          ],
          1
        )[0]
      : pickN(
          [
            `Overall, that's a ${grade}. Room to grow.`,
            `Calling it a ${grade} for now.`,
            `Landing on a ${grade}. Fixable, though.`,
          ],
          1
        )[0];

  return `${opener} ${body} ${closer}`;
}

export function generateRoast(
  user: GitHubUserData,
  repos: GitHubRepoData[],
  intensity: RoastIntensity = 'mild'
): RoastReport {
  const safeRepos = Array.isArray(repos) ? repos : [];
  const totalStars = safeRepos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const languages = safeRepos.map((r) => r.language).filter(Boolean) as string[];
  const originalRepos = safeRepos.filter((r) => !r.fork);
  const forkedRepos = safeRepos.filter((r) => r.fork);
  const undocumented = safeRepos.filter((r) => !r.description || r.description.trim() === '');
  const oneYearAgo = Date.now() - 1000 * 60 * 60 * 24 * 365;
  const staleRepos = safeRepos.filter((r) => new Date(r.pushed_at).getTime() < oneYearAgo);
  const ageYears = accountAgeInYears(user.created_at);

  const bestRepo = safeRepos.length
    ? [...safeRepos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0]
    : null;
  const staleFlagship = staleRepos.length
    ? [...staleRepos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0]
    : null;
  const oldestStale = staleRepos.length
    ? [...staleRepos].sort((a, b) => new Date(a.pushed_at).getTime() - new Date(b.pushed_at).getTime())[0]
    : null;
  const genericNamed = safeRepos.filter((r) =>
    GENERIC_REPO_NAMES.includes(r.name.toLowerCase().trim())
  );

  const ctx: RuleContext = {
    user, repos: safeRepos, originalRepos, forkedRepos, undocumented, staleRepos,
    languages, totalStars, ageYears, bestRepo, staleFlagship, oldestStale, genericNamed,
  };

  const monthsAgo = (dateStr: string) =>
    Math.max(1, Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30)));

  const rules: Rule[] = [
    {
      id: 'stars',
      test: (c) => c.user.public_repos > 10 && c.totalStars === 0,
      mild: (c) => `${c.user.public_repos} repos and zero stars — nobody's stopped by to say good job, not even once.`,
      fried: (c) => `${c.user.public_repos} repos, ZERO stars, this you? You've been cooking in an empty kitchen for years and calling it a restaurant.`,
      tip: 'Pick your best project, write a real README with a screenshot, and actually share it somewhere people who care will see it.',
      severity: 2,
    },
    {
      id: 'ratio',
      test: (c) => c.user.following > c.user.followers * 3 && c.user.followers < 20,
      mild: (c) => `following ${c.user.following} people while only ${c.user.followers} follow back — kind of a one-sided situationship.`,
      fried: (c) => `following ${c.user.following} people for ${c.user.followers} to follow back is not networking, that's a ratio and everyone can see it.`,
      tip: 'Follow people whose work you actually reference, not people you\'re hoping will follow back.',
      severity: 2,
    },
    {
      id: 'bio-empty',
      test: (c) => !c.user.bio || c.user.bio.trim() === '',
      mild: () => `the bio is empty, which is giving mysterious loner energy.`,
      fried: () => `bio: completely empty. Mysterious dev energy, or just nothing going on up there, we may never know.`,
      tip: 'Add one line about what you build. Costs nothing, gets read first.',
      severity: 1,
    },
    {
      id: 'bio-short',
      test: (c) => !!c.user.bio && c.user.bio.trim().length > 0 && c.user.bio.trim().length < 12,
      mild: (c) => `the bio just says "${c.user.bio}", groundbreaking stuff.`,
      fried: (c) => `the entire bio is "${c.user.bio}" — really used up all four seconds of someone's attention on that.`,
      tip: 'Expand it to one real sentence about what you actually build.',
      severity: 1,
    },
    {
      id: 'bio-buzzwords',
      test: (c) => !!c.user.bio && BUZZWORDS.some((w) => c.user.bio!.toLowerCase().includes(w)),
      mild: () => `the bio's got "ninja" or "rockstar" energy going on, which is a choice.`,
      fried: () => `calling yourself a "passionate 10x ninja" in the bio is genuinely one of the biggest red flags a profile can wave.`,
      tip: 'Swap the buzzwords for one concrete thing you\'ve actually shipped.',
      severity: 1,
    },
    {
      id: 'web-heavy',
      test: (c) => c.languages.length >= 3 && c.languages.filter((l) => l === 'CSS' || l === 'HTML').length / c.languages.length > 0.5,
      mild: () => `most of what's here is CSS and HTML, so the "full-stack" energy is doing a lot of heavy lifting.`,
      fried: () => `it's mostly CSS and HTML in here, and centering a div is not the flex you think it is.`,
      tip: 'Add one project that touches real logic — an API, a CLI tool, an algorithm — anything past layout.',
      severity: 2,
    },
    {
      id: 'forks',
      test: (c) => c.repos.length > 5 && c.forkedRepos.length / c.repos.length > 0.6,
      mild: (c) => `${c.forkedRepos.length} of ${c.repos.length} repos are just forks, so, credit where it's due, to someone else.`,
      fried: (c) => `${c.forkedRepos.length} out of ${c.repos.length} repos are forks — that's not a portfolio, that's a museum of other people's work with your name tag stuck on it.`,
      tip: 'Turn one fork into something genuinely yours and pin it — a real feature, not a typo fix.',
      severity: 2,
    },
    {
      id: 'ghost',
      test: (c) => c.ageYears > 2 && c.user.public_repos < 3,
      mild: (c) => `${c.ageYears.toFixed(1)} years on GitHub and only ${c.user.public_repos} repos to show for it, kind of a slow burn.`,
      fried: (c) => `${c.ageYears.toFixed(1)} years on this platform for ${c.user.public_repos} repos — what have you actually been doing this whole time, sir.`,
      tip: 'You don\'t need a masterpiece, just publish the small stuff you already build for yourself.',
      severity: 1,
    },
    {
      id: 'single-repo',
      test: (c) => c.ageYears > 1 && c.user.public_repos === 1,
      mild: (c) => `one repo, in ${c.ageYears.toFixed(1)} years, and that's the whole portfolio.`,
      fried: (c) => `ONE repo. Singular. After ${c.ageYears.toFixed(1)} years on this app. Bold strategy.`,
      tip: 'Publish two or three smaller things instead of gatekeeping one giant project.',
      severity: 2,
    },
    {
      id: 'abandonware',
      test: (c) => c.repos.length > 5 && c.staleRepos.length / c.repos.length > 0.7,
      mild: () => `over 70% of these repos haven't been touched in a year, it's giving abandoned side quest.`,
      fried: () => `over 70% of this is untouched for a year plus — this isn't a portfolio anymore, it's a digital graveyard and you're the only one who visits.`,
      tip: 'Archive what\'s truly dead and keep 2-3 things actually maintained.',
      severity: 2,
    },
    {
      id: 'stale-flagship',
      test: (c) => !!c.staleFlagship && c.staleFlagship.stargazers_count > 0,
      mild: (c) => `"${c.staleFlagship!.name}" is the best thing here with ${c.staleFlagship!.stargazers_count} star(s), and it hasn't been touched in ${monthsAgo(c.staleFlagship!.pushed_at)} months.`,
      fried: (c) => `"${c.staleFlagship!.name}" is genuinely the best thing you've ever made and you abandoned it ${monthsAgo(c.staleFlagship!.pushed_at)} months ago like it owed you money.`,
      tip: 'Go back and push one meaningful update to your actual best project. It\'s worth more than three new ones.',
      severity: 2,
    },
    {
      id: 'generic-names',
      test: (c) => c.genericNamed.length > 0,
      mild: (c) => `there's a repo literally called "${c.genericNamed[0].name}", naming things is hard apparently.`,
      fried: (c) => `there's a repo named "${c.genericNamed[0].name}" just sitting there in public like that's fine, like that's a name.`,
      tip: 'Rename anything called "test" or "my-app" — future employers judge repo names before they open them.',
      severity: 1,
    },
    {
      id: 'monoculture',
      test: (c) => {
        if (c.languages.length < 5) return false;
        const counts = c.languages.reduce<Record<string, number>>((a, l) => ((a[l] = (a[l] || 0) + 1), a), {});
        const top = Object.values(counts).sort((a, b) => b - a)[0];
        return top / c.languages.length > 0.8;
      },
      mild: () => `one language runs almost this whole account, comfort zone: found.`,
      fried: () => `one language, every single repo — the range is not giving what you think it's giving.`,
      tip: 'Pick a small project in a language outside your comfort zone. It doesn\'t need to be good, just different.',
      severity: 1,
    },
    {
      id: 'undocumented',
      test: (c) => c.repos.length > 5 && c.undocumented.length / c.repos.length > 0.7,
      mild: () => `most of these repos have no description, future-you is going to be so lost.`,
      fried: () => `no descriptions on almost anything here — future-you opens this in six months and has zero idea what past-you was even doing, absolute self-own.`,
      tip: 'A one-line description per repo takes thirty seconds and saves you from your own memory.',
      severity: 1,
    },
    {
      id: 'influencer',
      test: (c) => c.user.followers > 100 && c.originalRepos.length < 3,
      mild: (c) => `${c.user.followers} followers but fewer than 3 original repos, the clout and the output aren't matching up.`,
      fried: (c) => `${c.user.followers} followers for fewer than 3 original repos — the follower count is writing checks the commit history can't cash.`,
      tip: 'Let the follower count point at something real. Ship one project worth the attention.',
      severity: 2,
    },
    {
      id: 'gists',
      friedOnly: true,
      test: (c) => c.user.public_gists === 0 && c.user.public_repos > 5,
      mild: () => '',
      fried: () => `zero public gists, not even one snippet — couldn't even leave a crumb.`,
      tip: 'Post a couple of useful snippets as gists — low effort, recruiters actually skim these.',
      severity: 1,
    },
    {
      id: 'isolated',
      friedOnly: true,
      test: (c) => c.user.following < 5 && c.user.followers < 5 && c.user.public_repos > 5,
      mild: () => '',
      fried: (c) => `under 5 followers, under 5 following, and ${c.user.public_repos} repos — built an entire empire in complete isolation from every other person who codes.`,
      tip: 'Follow a few people whose projects you actually use, it\'s how you find collaborators later.',
      severity: 1,
    },
    {
      id: 'oldest-untouched',
      friedOnly: true,
      test: (c) => !!c.oldestStale && monthsAgo(c.oldestStale.pushed_at) > 24,
      mild: () => '',
      fried: (c) => `"${c.oldestStale!.name}" hasn't seen a commit in ${monthsAgo(c.oldestStale!.pushed_at)} months — at this point it's less "in progress" and more "historical artifact."`,
      tip: 'Either finish it or archive it — half-finished-forever is the worst state a repo can be in.',
      severity: 1,
    },
  ];

  const triggered = rules.filter((r) => (r.friedOnly ? intensity === 'deep-fried' && r.test(ctx) : r.test(ctx)));

  const points: RoastPoint[] = triggered
    .map((r) => ({
      id: r.id,
      fragment: intensity === 'deep-fried' ? r.fried(ctx) : r.mild(ctx),
      tip: r.tip,
      severity: r.severity,
    }))
    .filter((p) => p.fragment.trim() !== ''); 

  if (points.length === 0) {
    points.push({
      id: 'boring',
      fragment:
        intensity === 'deep-fried'
          ? `honestly this profile is so aggressively mediocre it wrapped back around to being kind of impressive, in a bad way.`
          : `nothing dramatic to flag here, just solidly average across the board.`,
      tip: 'Ironically the fix here is to take a risk: ship something bigger than what\'s already up.',
      severity: 1,
    });
  }

  const score = points.reduce((a, p) => a + p.severity, 0);
  const grade = gradeFromScore(score);
  const maxPossible = rules
    .filter((r) => !r.friedOnly || intensity === 'deep-fried')
    .reduce((a, r) => a + r.severity, 0);
  const uselessnessScore = Math.min(100, Math.round((score / maxPossible) * 100));
  const roastText = composeRoast(points, intensity, grade, user.login);

  return {
    roastText,
    points,
    grade,
    score,
    uselessnessScore,
    accountAgeYears: ageYears,
    totalStars,
    intensity,
  };
}