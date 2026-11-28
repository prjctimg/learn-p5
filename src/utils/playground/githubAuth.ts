import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GitHubAuthState, GitHubUser } from "../../types";

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = "playground_github_token";
const USER_KEY = "playground_github_user";

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") return AsyncStorage.getItem(key);
  try { return await SecureStore.getItemAsync(key); } catch { return AsyncStorage.getItem(key); }
}
async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") { await AsyncStorage.setItem(key, value); return; }
  try { await SecureStore.setItemAsync(key, value); } catch { await AsyncStorage.setItem(key, value); }
}
async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") { await AsyncStorage.removeItem(key); return; }
  try { await SecureStore.deleteItemAsync(key); } catch { await AsyncStorage.removeItem(key); }
}

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: "https://github.com/settings/connections/applications",
};

export function getGitHubRedirectUri() {
  return makeRedirectUri({ scheme: "learnp5", path: "oauth/github" });
}

export async function loadGitHubAuth(): Promise<GitHubAuthState | null> {
  try {
    const token = await secureGet(TOKEN_KEY);
    const userRaw = await secureGet(USER_KEY);
    if (!token || !userRaw) return null;
    return { accessToken: token, user: JSON.parse(userRaw) as GitHubUser };
  } catch {
    return null;
  }
}

export async function saveGitHubAuth(auth: GitHubAuthState): Promise<void> {
  await secureSet(TOKEN_KEY, auth.accessToken);
  await secureSet(USER_KEY, JSON.stringify(auth.user));
}

export async function clearGitHubAuth(): Promise<void> {
  await secureDelete(TOKEN_KEY).catch(() => {});
  await secureDelete(USER_KEY).catch(() => {});
}

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub user fetch failed: ${res.status}`);
  const data = await res.json();
  return { login: data.login, name: data.name, avatarUrl: data.avatar_url };
}

export async function exchangeGitHubCode(params: {
  code: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}): Promise<string> {
  // GitHub token exchange requires client_secret for web OAuth apps. For native/mobile,
  // a proxy or device flow is often used. We support direct exchange when clientSecret
  // is provided (e.g. dev/testing) and otherwise expect a token to be supplied manually.
  const body: Record<string, string> = {
    client_id: params.clientId,
    code: params.code,
    redirect_uri: params.redirectUri,
  };
  if (params.clientSecret) body.client_secret = params.clientSecret;
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || `Token exchange failed: ${res.status}`);
  }
  return data.access_token as string;
}

export function useGitHubAuthRequest(clientId: string) {
  const redirectUri = getGitHubRedirectUri();
  return useAuthRequest(
    {
      clientId: clientId || "disabled",
      scopes: ["gist", "read:user"],
      redirectUri,
      usePKCE: false,
    },
    discovery
  );
}

export async function signInWithToken(token: string): Promise<GitHubAuthState> {
  const user = await fetchGitHubUser(token.trim());
  const auth = { accessToken: token.trim(), user };
  await saveGitHubAuth(auth);
  return auth;
}

// end
