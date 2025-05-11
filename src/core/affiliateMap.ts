import * as a8net from "./a8net";

interface AffiliateMap {
  [key: string]: {
    isAffiliateLink: (url: string) => boolean;
    getOriginalLink: (url: string) => Promise<string>;
  };
}

export const affiliateMap: AffiliateMap = {
  a8net: {
    isAffiliateLink: a8net.isA8Net,
    getOriginalLink: a8net.getA8NetOriginal,
  },
};
