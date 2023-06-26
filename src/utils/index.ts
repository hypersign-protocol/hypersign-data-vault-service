const host = process.env.HOST
const ssl = process.env.SSL || false;
const absoluteURL = process.env.ABSOULTE_URL
const DATA_VAULT = process.env.DATA_VAULT || ".encData";
export { ssl, host, absoluteURL, DATA_VAULT };

import { createHash } from "crypto";





export const getHash = (str) => {
  const hash = createHash('sha1');
  return 'hs:vault:'+hash.update(str).digest('base64url');
};



// generate random document id

export const generateDocId = (str) => {
  const hash = createHash('sha256');
  return 'hs:doc:'+ hash.update(str).digest('base64url').toLowerCase();
}