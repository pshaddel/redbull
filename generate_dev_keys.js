/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const crypto = require("crypto");
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: "spki",
        format: "pem"
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    }
});
// check if the file exists
if (!fs.existsSync("private.key")) {
    fs.writeFileSync("private.key", privateKey);
}
if (!fs.existsSync("public.key")) {
    fs.writeFileSync("public.key", publicKey);
}