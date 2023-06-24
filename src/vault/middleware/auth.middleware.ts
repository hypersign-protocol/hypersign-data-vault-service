import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import * as crypto from "node:crypto";
import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { constants } from 'security-context'
import { verifyCapabilityInvocation } from "@digitalbazaar/http-signature-zcap-verify";
import { Ed25519Signature2020 } from "@digitalbazaar/ed25519-signature-2020";
import { createRootCapability, documentLoader } from "@digitalbazaar/zcap";
import { CryptoLD } from "crypto-ld";
import Web3 from "web3";

const { SECURITY_CONTEXT_V2_URL } = constants;

const zcapDocLoader = documentLoader;

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    async use(_req: Request, _res: Response, _next: NextFunction) {
        const { headers: signed } = _req;
        const { controller, vermethodid } = signed;

        const algorithm = signed.algorithm;
        switch (algorithm) {
            case "sha256-eth-personalSign":
                return await verifyHTTPRequestSIgnedByWeb3Wallet(_req, _res, _next);

            default: {
                // TODO: check if the controller is valid
                // TODO: check if the vermethodid is valid
                if (!controller || !vermethodid) {
                    return _res.status(401).send("Invalid controller or vermethodid");
                }

                const verMethod: string = vermethodid as string;
                // TODO: resolve the did of controller and fetch the verificationMethod

                const verificationMethod = {
                    id: vermethodid,
                    type: "Ed25519VerificationKey2020",
                    controller,
                    publicKeyMultibase: verMethod.split("#")[1],
                };

                // remove hadcongn
                const keyPair: Ed25519VerificationKey2020 =
                    await Ed25519VerificationKey2020.from({ ...verificationMethod });

                const HOST = process.env.HOST;



                if (HOST != signed.host) {
                    return _res.status(401).send("Invalid host");
                }

                const keyId = keyPair.id;

                // Using Ed25519Signature2020 suite
                const suite = new Ed25519Signature2020({
                    verificationMethod: keyId,
                    key: keyPair,
                });

                const documentLoader = async (uri: string) => {
                    if (uri === keyPair.controller) {
                        const doc = {
                            "@context": SECURITY_CONTEXT_V2_URL,
                            id: keyPair.controller,
                            capabilityInvocation: [keyId],
                        };
                        return {
                            contextUrl: null,
                            documentUrl: uri,
                            document: doc,
                        };
                    }
                    // when we dereference the keyId for verification
                    // all we need is the publicNode
                    if (uri === keyId) {
                        const doc = keyPair.export({ publicKey: true, includeContext: true });
                        return {
                            contextUrl: null,
                            documentUrl: uri,
                            document: doc,
                        };
                    }
                    if (uri === rootCapability.id) {
                        return {
                            contextUrl: null,
                            documentUrl: uri,
                            document: rootCapability,
                        };
                    }

                    return zcapDocLoader(uri);
                };

                // @ts-ignore
                const getVerifier = async ({ keyId, documentLoader }) => {
                    const cryptoLd = new CryptoLD();
                    cryptoLd.use(Ed25519VerificationKey2020);
                    const key = await cryptoLd.fromKeyId({ id: keyId, documentLoader });
                    const verificationMethod = await key.export({
                        publicKey: true,
                        includeContext: true,
                    });
                    const verifier = key.verifier();
                    return { verifier, verificationMethod };
                };
                const isSSL = process.env.SSL as unknown as boolean
                const absoluteURL = process.env.ABSOLUTE_URL;
                const url =
                    (String(isSSL) === "true" ? "https" : "http") +
                    "://" +
                    absoluteURL +
                    _req.originalUrl;
                const rootCapability = createRootCapability({
                    controller: keyPair.controller,
                    invocationTarget: url,
                });




                const { verified, error } = await verifyCapabilityInvocation({
                    url,
                    method: _req.method,
                    suite,
                    headers: signed,
                    expectedAction: _req.method === "GET" ? "read" : "write",
                    expectedHost: HOST,
                    expectedRootCapability: rootCapability.id,
                    expectedTarget: url,
                    keyId,
                    documentLoader,
                    getVerifier,
                });

                if (error) {
                    return _res.status(401).send("Could not verify the signature");
                }

                if (verified === true) {
                    return _next();
                } else {
                    return _res.status(401).send("Could not verify the signature");
                }
            }
        }
        _next();
    }
}

export async function verifyHTTPRequestSIgnedByWeb3Wallet(
    _req: Request,
    _res: Response,
    _next: NextFunction
) {
    const { headers: signed } = _req;
    const { controller, vermethodid } = signed;
    const isSSL = process.env.SSL as unknown as boolean

    const absoluteURL = process.env.ABSOLUTE_URL;
    const url =
        (String(isSSL) === "true" ? "https" : "http") +
        "://" +
        absoluteURL +
        _req.originalUrl;

    const method = _req.method;
    const body = _req.body;
    const authorization = signed.authorization;
    const reformedHeaders = {};
    const signedHeaders = getSignedHeaders(authorization);
    signedHeaders.forEach((header) => {
        reformedHeaders[header] = signed[header];
    });

    const { canonicalRequest } = await createCanonicalRequest({
        url,
        method,
        query: _req.query,
        headers: reformedHeaders,
        body,
    });

    // get base64 encoded signature from headers Authorization
    const base64Signature = authorization.split('signature="')[1].split('"')[0];

    // convert signature to hex

    const hexSignature =
        "0x" + Buffer.from(base64Signature, "base64").toString("hex");
    let fn = console.warn;
    console.warn = () => { }
    const web3 = new Web3(Web3.givenProvider);
    console.warn = fn
    const address = await web3.eth.accounts.recover(
        canonicalRequest,
        hexSignature
    );
    const vm = vermethodid as string;
    const actualAddr = vm.split("#")[1].split(":")[2];

    if (
        web3.utils.toChecksumAddress(address) ===
        web3.utils.toChecksumAddress(actualAddr)
    ) {
        return _next();
    }
    return _res.status(401).send("Could not verify the signature");
}

function getSignedHeaders(authorization: string) {
    const re = /headers="(.*?)"/;
    const match = re.exec(authorization);
    if (match) {
        match[1] = match[1].replace(/ /g, "");
        return match[1].replace(/\(|\)/g, "").toLowerCase().split(",");
    }
    return null;
}

// TODO: also verify if the digest is correct.
export async function verifyDigest(
    _req: Request,
    _res: Response,
    _next: Function
) {
    const { headers: signed } = _req;
    const { digest } = signed;
    console.log(digest);
    _next();
}

async function createCanonicalRequest({ url, method, query, headers, body }) {
    let action = "read";
    if (
        method.toUpperCase() === "POST" ||
        method.toUpperCase() === "PUT" ||
        method.toUpperCase() === "DELETE"
    ) {
        action = "write";
    }
    let payloadHash;

    if (typeof body == "object") {
        body = canonicalizeJSON(body);
        if (
            typeof window !== "undefined" &&
            window.crypto &&
            window.crypto.subtle
        ) {
            payloadHash = await window.crypto.subtle
                .digest("SHA-256", new TextEncoder().encode(body || ""))
                .then((hash) => {
                    const hashArray = Array.from(new Uint8Array(hash));
                    const base64 = btoa(String.fromCharCode(...hashArray));
                    return base64;
                });
        } else {

            payloadHash = crypto
                .createHash("sha256")
                .update(body || "")
                .digest("base64");
            payloadHash = payloadHash.toString("base64");
        }
        if (method.toUpperCase() !== "GET") {
            headers["digest"] = `SHA-256=${payloadHash}`;
        }
    }

    const urlObj = new URL(url);
    headers["host"] = urlObj.host;
    query = urlObj.searchParams;
    const path = urlObj.pathname;
    headers["request-target"] = urlObj.href;

    headers["capability-invocation"] = `zcap id="urn:zcap:root:${encodeURI(
        headers["request-target"]
    )}",action="${action}"`;

    const canonicalURI = encodeURIComponent(path);
    let canonicalQueryString = "";
    if (query) {
        const entries = query.entries();
        const result = {};
        for (const [key, value] of entries) {
            // each 'entry' is a [key, value] tupple
            result[key] = value;
        }
        canonicalQueryString = Object.keys(result)
            .sort()
            .map(
                (key) => `${encodeURIComponent(key)}=${encodeURIComponent(result[key])}`
            )
            .join("&");
    }
    const canonicalHeaders = Object.keys(headers)
        .map(
            (key) =>
                `${key.toLowerCase()}:${headers[key].trim().replace(/\s+/g, " ")}`
        )
        .sort()
        .join("\n");

    const signedHeaders = Object.keys(headers)

        .map((key) => {
            let k = key.toLowerCase();
            switch (k) {
                case "keyid":
                    return "keyId";
                case "created":
                    return "(created)";
                case "expires":
                    return "(expires)";
                case "request-target":
                    return "(request-target)";
                default:
                    return k;
            }
        })
        .sort()
        .join(", ");

    const canonicalRequest = [
        method.toUpperCase(),
        canonicalURI,
        canonicalQueryString,
        canonicalHeaders,
        "",
        signedHeaders,
    ].join("\n");

    return { canonicalRequest, canonicalHeaders, signedHeaders, payloadHash };
}

function canonicalizeJSON(json) {
    // Step 1: Convert to JSON string
    const jsonString = JSON.stringify(json);

    // Step 2: Normalize line endings to CRLF
    const crlfString = jsonString.replace(/\r?\n/g, "\r\n");

    // Step 3: Remove all whitespace between tokens
    const compactString = crlfString.replace(/\s+/g, "");

    // Step 4: Sort the keys in every object in the JSON structure
    const sortedJson = JSON.parse(crlfString, (key, value) => {
        if (Array.isArray(value)) {
            return value.map((val) => {
                if (typeof val === "object" && val !== null) {
                    return Object.keys(val)
                        .sort()
                        .reduce((acc, curr) => {
                            acc[curr] = val[curr];
                            return acc;
                        }, {});
                } else {
                    return val;
                }
            });
        } else if (typeof value === "object" && value !== null) {
            return Object.keys(value)
                .sort()
                .reduce((acc, curr) => {
                    acc[curr] = value[curr];
                    return acc;
                }, {});
        } else {
            return value;
        }
    });

    // Step 5: Convert back to string
    const sortedString = JSON.stringify(sortedJson);

    return sortedString;
}
