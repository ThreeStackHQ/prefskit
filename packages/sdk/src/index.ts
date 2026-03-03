export interface PrefsKitConfig {
  apiKey: string;
  baseUrl?: string;
}

export class PrefsKit {
  private config: PrefsKitConfig;

  constructor(config: PrefsKitConfig) {
    this.config = config;
  }

  static init(config: PrefsKitConfig): PrefsKit {
    return new PrefsKit(config);
  }

  async canSend(_email: string, _category: string): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async unsubscribeUrl(_email: string): Promise<string> {
    throw new Error("Not implemented");
  }

  async suppress(_email: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async restore(_email: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
