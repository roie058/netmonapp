const {
  checkIp,
  fetchDir,
  readAllFileServer,
} = require("../util/fileHandlers");

//fetch a list of all sflow and netflow files
const fetchData = async (req, res, next) => {
  const avalibleNetflowFiles = await fetchDir("C:/monitorm/util/netflow/data");
  const avalibleSflowFiles = await fetchDir("C:/monitorm/util/sflow/data");

  const avalibleFiles = avalibleNetflowFiles.concat(avalibleSflowFiles);

  res.status(200).json({ fileList: avalibleFiles });
};

//get file list and send array of parsed fileObj
const analyzeDataOnServer = async (req, res, next) => {
  const { filesList } = req.body;
  let parsedArray = await readAllFileServer(filesList);
  const reduced = parsedArray.reduce(
    (accumulator, currentValue) => [...accumulator, ...currentValue],
    []
  );
  res.status(201).json({ fileArr: reduced });
};

//get sender list read the intf and send intf data to client
const createIntf = async (req, res, next) => {
  let { senderList } = req.body;
  let intfsNetflow;
  let intfsSflow;
  if (senderList.netflow) {
    intfsNetflow = await fetchDir(
      "C:/monitorm/util/netflow/data",
      senderList.netflow
    );
  }
  if (senderList.sflow) {
    intfsSflow = await fetchDir(
      "C:/monitorm/util/sflow/data",
      senderList.sflow
    );
  }

  const intfs = { ...intfsNetflow, ...intfsSflow };

  res.status(200).json({ portList: intfs });
};

//get ip and send back hostName
const dns = async (req, res, next) => {
  const ip = req.body.ipHost;
  const host = await checkIp(ip);
  res.status(200).json({ host: host });
};

exports.createIntf = createIntf;
exports.dns = dns;
exports.fetchData = fetchData;
exports.analyzeDataOnServer = analyzeDataOnServer;
