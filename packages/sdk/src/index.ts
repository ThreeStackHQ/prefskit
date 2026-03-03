export interface PrefsKitConfig {
  apiKey: string;
  baseUrl?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export class PrefsKit {
  private config: PrefsKitConfig;
  private baseUrl: string;

  constructor(config: PrefsKitConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl ?? "https://api.prefskit.com";
  }

  static init(config: PrefsKitConfig): PrefsKit {
    return new PrefsKit(config);
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        ...options.headers,
      },
    });

    const json = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      return { error: (json.error as string) ?? "Unknown error" };
    }

    return { data: json as T };
  }

  async canSend(email: string, category: string): Promise<boolean> {
    const res = await this.request<{
      preferences: Array<{
        categoryId: string;
        subscribed: boolean;
      }>;
    }>(`/api/v1/preferences?email=${encodeURIComponent(email)}&category=${encodeURIComponent(category)}`);

    if (res.error || !res.data) return true; // Default to sendable
    const pref = res.data.preferences.find(
      (p) => p.categoryId === category,
    );
    return pref ? pref.subscribed : true;
  }

  async unsubscribeUrl(email: string): Promise<string> {
    const res = await this.request<{ url: string }>(
      `/api/v1/preferences/unsubscribe-url?email=${encodeURIComponent(email)}`,
    );

    if (res.error || !res.data) {
      throw new Error(res.error ?? "Failed to generate unsubscribe URL");
    }

    return res.data.url;
  }

  async suppress(email: string): Promise<void> {
    const res = await this.request("/api/v1/subscribers/suppress", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (res.error) {
      throw new Error(res.error);
    }
  }

  async restore(email: string): Promise<void> {
    const res = await this.request("/api/v1/subscribers/restore", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (res.error) {
      throw new Error(res.error);
    }
  }
}
