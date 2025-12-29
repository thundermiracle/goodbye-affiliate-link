export interface ResolveAffiliateLinksMessage {
  type: "RESOLVE_AFFILIATE_LINKS";
  links: string[];
}

export interface ResolveAffiliateLinksResponse {
  /**
   * Key: original url
   * Value: resolved url
   */
  resolvedLinks: Record<string, string>;
}
