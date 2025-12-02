"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type GithubProfile = {
  username: string;
  followers: number;
  public_repos: number;
  repos: {
    name: string;
    stars: number;
    languages: string[];
  }[];
  contributions: {
    totalContributions: number;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
  };
};

export default function GithubFetcher() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasGithubIdentity, setHasGithubIdentity] = useState(false);
  const [needsGithubAuth, setNeedsGithubAuth] = useState(false);

  // Observe auth state so the UI updates after OAuth redirect
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(sessionData.session);
      setUserEmail(sessionData.session?.user?.email ?? null);

      if (sessionData.session?.user?.identities) {
        const hasGh = sessionData.session.user.identities.some(
          (id: any) => id.provider === "github"
        );
        setHasGithubIdentity(hasGh);
        
        // Check if user has GitHub identity but no provider token (email/password user)
        if (hasGh) {
          const githubIdentity = sessionData.session.user.identities.find(
            (id: any) => id.provider === 'github'
          );
          const hasProviderToken = sessionData.session.provider_token || githubIdentity?.identity_data?.access_token;
          setNeedsGithubAuth(!hasProviderToken);
        }
      }

      setAuthChecking(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUserEmail(sess?.user?.email ?? null);
      if (sess?.user?.identities) {
        const hasGh = sess.user.identities.some((id: any) => id.provider === "github");
        setHasGithubIdentity(hasGh);
        
        if (hasGh) {
          const githubIdentity = sess.user.identities.find(
            (id: any) => id.provider === 'github'
          );
          const hasProviderToken = sess.provider_token || githubIdentity?.identity_data?.access_token;
          setNeedsGithubAuth(!hasProviderToken);
        }
      }
    });

    init();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGitHub = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user user:email repo",
        redirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
  };

  const connectGithub = async () => {
    setError(null);
    const { error } = await supabase.auth.linkIdentity({
      provider: "github",
      options: {
        scopes: "read:user user:email repo",
        redirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (error) {
      if (error.message.includes("identity_already_exists")) {
        setError("⚠️ This GitHub account is already linked to another user. Please sign in with GitHub instead.");
      } else {
        setError(error.message);
      }
      console.error(error);
    }
  };

  const fetchAndSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // 0) Ensure we have a session + provider token
      const [{ data: sess }, { data: userData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

      const session = sess.session;
      if (!session) throw new Error("Not authenticated with Supabase.");

      // Try multiple ways to get the GitHub access token
      let providerToken: string | undefined;

      // Method 1: Direct from session (works for direct GitHub sign-in)
      providerToken = session.provider_token ?? undefined;

      // Method 2: From user identities (works for linked accounts)
      if (!providerToken && session.user?.identities) {
        const githubIdentity = session.user.identities.find(
          (id: any) => id.provider === 'github'
        );
        providerToken = githubIdentity?.identity_data?.access_token;
      }

      // Method 3: Refresh session to get the token
      if (!providerToken) {
        const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        
        providerToken = refreshedSession.session?.provider_token ?? undefined;
        
        // Try identities again after refresh
        if (!providerToken && refreshedSession.session?.user?.identities) {
          const githubIdentity = refreshedSession.session.user.identities.find(
            (id: any) => id.provider === 'github'
          );
          providerToken = githubIdentity?.identity_data?.access_token;
        }
      }

      // If still no token, force GitHub sign-in
      if (!providerToken) {
        setNeedsGithubAuth(true);
        throw new Error("GitHub access required. Please sign in with GitHub to continue.");
      }

      // 1) Fetch profile
      const ghHeaders = { Authorization: `token ${providerToken}` };
      const userRes = await fetch("https://api.github.com/user", {
        headers: ghHeaders,
      });
      if (!userRes.ok) throw new Error(`GitHub user error: ${userRes.statusText}`);
      const ghUser = await userRes.json();

      // 2) Fetch repos
      const reposRes = await fetch(`${ghUser.repos_url}?per_page=100`, {
        headers: ghHeaders,
      });
      if (!reposRes.ok) throw new Error(`GitHub repos error: ${reposRes.statusText}`);
      const reposData = await reposRes.json();

      const repos = await Promise.all(
        (reposData || []).map(async (repo: any) => {
          const langsRes = await fetch(repo.languages_url, { headers: ghHeaders });
          const langsData = langsRes.ok ? await langsRes.json() : {};
          return {
            name: repo.name,
            stars: repo.stargazers_count,
            languages: Object.keys(langsData || {}),
          };
        })
      );

      // 3) Contributions (GraphQL)
      const graphQLQuery = {
        query: `
          query ($login: String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                }
                totalCommitContributions
                totalPullRequestContributions
                totalIssueContributions
              }
            }
          }
        `,
        variables: { login: ghUser.login },
      };

      const gqlRes = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `bearer ${providerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphQLQuery),
      });
      if (!gqlRes.ok) throw new Error(`GitHub GraphQL error: ${gqlRes.statusText}`);
      const gqlData = await gqlRes.json();

      const contrib = gqlData?.data?.user?.contributionsCollection ?? {};
      const githubProfile: GithubProfile = {
        username: ghUser.login,
        followers: ghUser.followers,
        public_repos: ghUser.public_repos,
        repos,
        contributions: {
          totalContributions:
            contrib?.contributionCalendar?.totalContributions ?? 0,
          totalCommits: contrib?.totalCommitContributions ?? 0,
          totalPRs: contrib?.totalPullRequestContributions ?? 0,
          totalIssues: contrib?.totalIssueContributions ?? 0,
        },
      };

      // 4) Save to Supabase
      const { error: upsertErr } = await supabase.from("profiles").upsert(
        {
          id: userData.user?.id,
          email: userData.user?.email ?? null,
          github_profile: githubProfile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (upsertErr) throw upsertErr;

      setProfile(githubProfile);
      setNeedsGithubAuth(false);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-800/20 space-y-4 ">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {authChecking
            ? "Checking session…"
            : session
            ? `Signed in as ${userEmail}`
            : "Not signed in"}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-row items-center justify-between gap-8">
          <h3 className="font-semibold text-gray-900 dark:text-white">GitHub Integration</h3>
          {session && hasGithubIdentity && !needsGithubAuth && (
            <button
              onClick={fetchAndSave}
              disabled={loading}
              className="bg-primary text-white px-4 py-2.5 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Fetching & Saving…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Fetch & Save GitHub Profile
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Force GitHub sign-in if no provider token */}
        {needsGithubAuth && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
              GitHub authentication required to access your profile data.
            </p>
            <button
              onClick={signInWithGitHub}
              className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 30 30">
                <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
              </svg>
              Sign in with GitHub
            </button>
          </div>
        )}

        {!session && !needsGithubAuth ? (
          <button
            onClick={signInWithGitHub}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-4 py-2.5 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 30 30">
              <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
            </svg>
            Sign in with GitHub
          </button>
        ) : null}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-red-600 dark:text-red-300 text-sm">⚠️ {error}</p>
          </div>
        )}

        {profile && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-md max-h-52">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">GitHub Profile Data:</h4>
            <pre className="text-xs text-green-700 dark:text-green-300 overflow-x-auto max-h-40">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(profile).filter(([key]) => key !== "repos")
                ),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}