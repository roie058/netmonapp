const { readPortList } = require("../util/readPortList");
const {
  FastReadAllFiles,
  fastCsvFileToArray,
  checkIp,
  fetchDir,
  readAllFileServer,
} = require("../util/fileHandlers");

const fetchData = async (req, res, next) => {
  const avalibleFiles = await fetchDir(
    "C:/Users/roie0/OneDrive/שולחן העבודה/netflow"
  );
  res.status(200).json({ fileList: avalibleFiles });
};

const fetchIntf = async (req, res, next) => {
  const sender = req.params.sender;
  const intf = await fetchDir(
    "C:/Users/roie0/OneDrive/שולחן העבודה/netflow",
    sender
  );
  res.status(200).json({ intf: intf });
};

const analyzeDataOnServer = async (req, res, next) => {
  const { filesList } = req.body; //filesList [fileObj..]
  let parsedArray = await readAllFileServer(JSON.parse(filesList));
  const reduced = parsedArray.reduce(
    (accumulator, currentValue) => [...accumulator, ...currentValue],
    []
  );
  res.status(201).json({ fileArr: reduced });
};

const createIntf = async (req, res, next) => {
  let file = req.files;
  const portList = await readPortList(file);
  res.status(200).json({ portList: portList });
};

const analyzeData = async (req, res, next) => {
  let file = req.files;
  //one file handler
  if (file.length === 1) {
    const fileArr = await fastCsvFileToArray(file[0]);
    res.status(200).json({ fileArr: fileArr });
  }
  //multiple file handler
  if (file.length > 1) {
    let parsedArray = await FastReadAllFiles(file);
    const reduced = parsedArray.reduce(
      (accumulator, currentValue) => [...accumulator, ...currentValue],
      []
    );
    res.status(201).json({ fileArr: reduced });
  }
};

const dns = async (req, res, next) => {
  const ip = req.body.ipHost;
  const host = await checkIp(ip);
  res.status(200).json({ host: host });
};

exports.analyzeData = analyzeData;
exports.createIntf = createIntf;
exports.dns = dns;
exports.fetchIntf = fetchIntf;
exports.fetchData = fetchData;
exports.analyzeDataOnServer = analyzeDataOnServer;
