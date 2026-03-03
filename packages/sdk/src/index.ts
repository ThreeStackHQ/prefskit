/**
 * @prefskit/sdk — Email preference center SDK for indie SaaS
 */

export class NotImplementedError extends Error {
  constructor(method: string) {
    super(`PrefsKit.${method}() is not yet implemented`);
    this.name = "NotImplementedError";
  }
}

export interface PrefsKitOptions {
  /** Your PrefsKit API key */
  apiKey: string;
  /** Optional: override the API base URL (default: https://prefskit.threestack.io) */
  baseUrl?: string;
}

export interface PrefsKitInitResult {
  workspaceId: string;
  plan: "free" | "indie" | "pro";
}

export class PrefsKit {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: PrefsKitOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://prefskit.threestack.io";
  }

  /**
   * Initialize and verify connection to PrefsKit API.
   * Returns workspace details.
   */
  async init(): Promise<PrefsKitInitResult> {
    // @ts-ignore — stub
    throw new NotImplementedError("init");
  }

  /**
   * Check whether the given email address can receive emails for a category.
   * Returns false if the subscriber has opted out or is suppressed.
   *
   * @param email — subscriber email
   * @param category — category slug (e.g. "marketing", "transactional")
   */
  async canSend(email: string, category: string): Promise<boolean> {
    // @ts-ignore — stub
    void email;
    // @ts-ignore — stub
    void category;
    throw new NotImplementedError("canSend");
  }

  /**
   * Generate a signed unsubscribe URL for a subscriber.
   * The link opens /u/[token] which lets them manage their preferences.
   *
   * @param email — subscriber email
   */
  unsubscribeUrl(email: string): string {
    // @ts-ignore — stub
    void email;
    throw new NotImplementedError("unsubscribeUrl");
  }

  /**
   * Globally suppress an email address (e.g. after a hard bounce or complaint).
   * Suppressed emails will never receive any emails regardless of preferences.
   *
   * @param email — email to suppress
   * @param reason — suppression reason: "global" | "bounce" | "complaint"
   */
  async suppress(
    email: string,
    reason: "global" | "bounce" | "complaint" = "global",
  ): Promise<void> {
    // @ts-ignore — stub
    void email;
    // @ts-ignore — stub
    void reason;
    throw new NotImplementedError("suppress");
  }

  /**
   * Remove a suppression for an email address, allowing them to receive emails again.
   *
   * @param email — email to restore
   */
  async restore(email: string): Promise<void> {
    // @ts-ignore — stub
    void email;
    throw new NotImplementedError("restore");
  }
}

/** Convenience factory — same as `new PrefsKit(options)` */
export function createPrefsKit(options: PrefsKitOptions): PrefsKit {
  return new PrefsKit(options);
}

export default PrefsKit;
