// const os = require("os");
// const dns = require("dns/promises");
const dns = require("dns/promises");
const os = require("os");

const main = async () => {
  const hostComp = os.hostname();
  return await dns.lookup(hostComp, { family: 4 });
};

module.exports = main();
