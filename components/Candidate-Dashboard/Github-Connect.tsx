"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

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

  const [session, setSession] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [hasGithubIdentity, setHasGithubIdentity] = useState(false);
  const [hasGithubProfile, setHasGithubProfile] = useState(false);
  const [needsGithubAuth, setNeedsGithubAuth] = useState(false);

  const [profile, setProfile] = useState<GithubProfile | null>(null);

  /* ----------------------------------
     AUTH + PROFILE STATE
  ---------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadProfileState = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("github_profile")
        .eq("id", userId)
        .single();

      if (!mounted) return;

      if (data?.github_profile) {
        setHasGithubProfile(true);
        setProfile(data.github_profile as GithubProfile);
      } else {
        setHasGithubProfile(false);
        setProfile(null);
      }
    };

    const resolveGithubAuthState = (sess: any) => {
      const identities = sess?.user?.identities ?? [];
      const githubIdentity = identities.find(
        (id: any) => id.provider === "github"
      );

      setHasGithubIdentity(!!githubIdentity);

      const hasToken =
        sess?.provider_token ||
        githubIdentity?.identity_data?.access_token;

      setNeedsGithubAuth(!!githubIdentity && !hasToken);
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const sess = data.session;
      setSession(sess);
      setUserEmail(sess?.user?.email ?? null);

      if (sess?.user?.id) {
        await loadProfileState(sess.user.id);
        resolveGithubAuthState(sess);
      }

      setAuthChecking(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        setSession(sess);
        setUserEmail(sess?.user?.email ?? null);

        if (sess?.user?.id) {
          await loadProfileState(sess.user.id);
          resolveGithubAuthState(sess);
        }
      }
    );

    init();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  /* ----------------------------------
     AUTH ACTIONS
  ---------------------------------- */
  const signInWithGitHub = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user user:email repo",
        redirectTo: window.location.origin,
      },
    });
  };

  const connectGithub = async () => {
    setError(null);

    const { error } = await supabase.auth.linkIdentity({
      provider: "github",
      options: {
        scopes: "read:user user:email repo",
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(
        error.message.includes("identity_already_exists")
          ? "This GitHub account is already linked to another user."
          : error.message
      );
    }
  };

  /* ----------------------------------
     FETCH + SAVE GITHUB DATA
  ---------------------------------- */
  const fetchAndSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const [{ data: sess }, { data: userData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

      const session = sess.session;
      if (!session) throw new Error("Not authenticated.");

      const identities = session.user?.identities ?? [];
      let providerToken =
        session.provider_token ||
        identities.find((i: any) => i.provider === "github")
          ?.identity_data?.access_token;

      if (!providerToken) {
        const { data: refreshed } =
          await supabase.auth.refreshSession();

        const refreshedIdentities =
          refreshed.session?.user?.identities ?? [];

        providerToken =
          refreshed.session?.provider_token ||
          refreshedIdentities.find((i: any) => i.provider === "github")
            ?.identity_data?.access_token;
      }

      if (!providerToken) {
        setNeedsGithubAuth(true);
        throw new Error("GitHub authorization required.");
      }

      const headers = { Authorization: `token ${providerToken}` };

      const userRes = await fetch("https://api.github.com/user", { headers });
      if (!userRes.ok) throw new Error("GitHub user fetch failed");
      const ghUser = await userRes.json();

      const gqlRes = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `bearer ${providerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query ($login: String!) {
              user(login: $login) {
                contributionsCollection {
                  contributionCalendar { totalContributions }
                  totalCommitContributions
                  totalPullRequestContributions
                  totalIssueContributions
                }
              }
            }
          `,
          variables: { login: ghUser.login },
        }),
      });

      const gql = await gqlRes.json();
      const c = gql?.data?.user?.contributionsCollection;

      const githubProfile: GithubProfile = {
        username: ghUser.login,
        followers: ghUser.followers,
        public_repos: ghUser.public_repos,
        repos: [],
        contributions: {
          totalContributions:
            c?.contributionCalendar?.totalContributions ?? 0,
          totalCommits: c?.totalCommitContributions ?? 0,
          totalPRs: c?.totalPullRequestContributions ?? 0,
          totalIssues: c?.totalIssueContributions ?? 0,
        },
      };

      const { error } = await supabase.from("profiles").upsert(
        {
          id: userData.user?.id,
          email: userData.user?.email ?? null,
          github_profile: githubProfile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      setProfile(githubProfile);
      setHasGithubProfile(true);
      setNeedsGithubAuth(false);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <p className="text-sm text-muted-foreground">
        {authChecking
          ? "Checking session…"
          : session
          ? `Signed in as ${userEmail}`
          : "Not signed in"}
      </p>

      {!session && (
        <Button className="w-full" onClick={signInWithGitHub}>
          Sign in with GitHub
        </Button>
      )}

      {session && !hasGithubIdentity && (
        <Button className="w-full" onClick={connectGithub}>
          Connect GitHub
        </Button>
      )}

      {session && hasGithubIdentity && !needsGithubAuth && (
        <Button
          className="w-full"
          onClick={fetchAndSave}
          disabled={loading}
        >
          {loading ? "Fetching…" : "Fetch & Refresh GitHub Profile"}
        </Button>
      )}

      {needsGithubAuth && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={signInWithGitHub}
        >
          Re-authorize GitHub
        </Button>
      )}

      {/* DISPLAY STORED DATA */}
      {profile && (
        <div className="p-4 border rounded-md bg-muted/30 space-y-2">
          <p className="text-sm font-medium">GitHub Summary</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Followers:</strong> {profile.followers}</p>
            <p><strong>Public Repos:</strong> {profile.public_repos}</p>
            <p><strong>Total Contributions:</strong> {profile.contributions.totalContributions}</p>
            <p><strong>Commits:</strong> {profile.contributions.totalCommits}</p>
            <p><strong>PRs:</strong> {profile.contributions.totalPRs}</p>
            <p><strong>Issues:</strong> {profile.contributions.totalIssues}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
