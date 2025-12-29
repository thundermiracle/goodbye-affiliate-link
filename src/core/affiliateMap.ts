import * as a8net from "./a8net";
import * as accesstrade from "./accesstrade";
import * as amazon from "./amazon";
import * as linka from "./linka";
import * as moshimo from "./moshimo";
import * as rakuten from "./rakuten";
import * as valuecommerce from "./valuecommerce";
import * as zucks from "./zucks";

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
  accesstrade: {
    isAffiliateLink: accesstrade.isAccessTrade,
    getOriginalLink: accesstrade.getAccessTradeOriginal,
  },
  amazon: {
    isAffiliateLink: amazon.isAmazon,
    getOriginalLink: amazon.getAmazonOriginal,
  },
  linka: {
    isAffiliateLink: linka.isLinkA,
    getOriginalLink: linka.getLinkAOriginal,
  },
  moshimo: {
    isAffiliateLink: moshimo.isMoshimo,
    getOriginalLink: moshimo.getMoshimoOriginal,
  },
  rakuten: {
    isAffiliateLink: rakuten.isRakuten,
    getOriginalLink: rakuten.getRakutenOriginal,
  },
  valuecommerce: {
    isAffiliateLink: valuecommerce.isValueCommerce,
    getOriginalLink: valuecommerce.getValueCommerceOriginal,
  },
  zucks: {
    isAffiliateLink: zucks.isZucks,
    getOriginalLink: zucks.getZucksOriginal,
  },
};
