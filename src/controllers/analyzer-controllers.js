const {
  checkIp,
  fetchDir,
  readAllFileServer,
} = require("../util/fileHandlers");
//const sflowPath = "C:/monitorm/util/sflow/data";
const sflowPath = "C:/Users/roie0/OneDrive/שולחן העבודה/sflow";
//const netflowPath = "C:/monitorm/util/netflow/data";
const netflowPath = "C:/Users/roie0/OneDrive/שולחן העבודה/netflow";

//fetch a list of all sflow and netflow files
const fetchData = async (req, res, next) => {
  const { isSflow } = req.params;

  let avalibleFiles;
  if (isSflow === "true") {
    avalibleFiles = await fetchDir(sflowPath);
  } else {
    avalibleFiles = await fetchDir(netflowPath);
  }
  //const avalibleFiles = avalibleNetflowFiles.concat(avalibleSflowFiles);
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

//get all available senders by sflow and netflow
//get sender list read the intf and send intf data to client
const getIntf = async (req, res, next) => {
  const avalibleNetflowIntfs = await fetchDir(netflowPath, []);
  const avalibleSflowIntfs = await fetchDir(sflowPath, []);
  const intfs = { sflow: avalibleSflowIntfs, netflow: avalibleNetflowIntfs };

  res.status(200).json({ portList: intfs });
};

//get sender list read the intf and send intf data to client
const createIntf = async (req, res, next) => {
  let { senderList } = req.body;
  let intfsNetflow;
  let intfsSflow;
  if (senderList.netflow.length) {
    intfsNetflow = await fetchDir(netflowPath, senderList.netflow);
  }
  if (senderList.sflow.length) {
    intfsSflow = await fetchDir(sflowPath, senderList.sflow);
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
exports.getIntf = getIntf;
exports.analyzeDataOnServer = analyzeDataOnServer;
