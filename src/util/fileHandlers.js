const fs = require("fs");
const fastCsv = require("fast-csv");
const dnsPromises = require("dns");
const { isIP } = require("net");

//new fast csv reader
const fastCsvFileToArray = async (file) => {
  const options = {
    objectMode: true,
    delimiter: ",",
    quote: null,
    headers: [
      "CMD",
      "ipSender",
      "outputPort1",
      "outputPort2",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "srcIp",
      "dstIp",
      "ipProtocol",
      undefined,
      undefined,
      "srcPort",
      "dstPort",
      undefined,
      "packets",
      "ipSize",
      undefined,
    ],
    renameHeaders: true,
    ignoreEmpty: true,
    strictColumnHandling: true,
  };

  let data = [];
  if (!file) {
    return;
  }

  const results = await new Promise((resolve, reject) => {
    fs.createReadStream(file.path)
      .pipe(
        fastCsv
          .parse(options)
          .validate((data) => data.CMD === "FLOW")
          .transform((data) => ({
            ...data,
            packets: parseInt(data.packets),
            ipSize: parseInt(data.ipSize),
            isSflow: file.filename.includes("sflow"),
            count: 1,
            key: `${data.srcIp}:${data.srcPort}-${data.dstIp}:${data.dstPort}`,
          }))
      )
      .on("error", (error) => {
        reject(error);
      })
      .on("data", async (row) => {
        await data.push(row);
      })
      .on("end", (rowCount) => {
        resolve(data);
      });
  });
  return results;
};

const readSendersNames = async (path, sender) => {
  const options = {
    objectMode: true,
    delimiter: ",",
    quote: null,
    headers: [
      undefined,
      undefined,
      undefined,
      undefined,
      "ipSender",
      "senderName",
      "description",
      undefined,
      undefined,
      undefined,
    ],
    ignoreEmpty: true,
    strictColumnHandling: true,
  };

  let data = [];
  if (!path) {
    return;
  }
  const results = await new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(fastCsv.parse(options).validate((data) => data.ipSender === sender))
      .on("error", (error) => {
        reject(error);
      })
      .on("data", async (row) => {
        resolve(row);
      })
      .on("end", (rowCount) => {
        resolve(data);
      });
  });
  return results;
};

//fetch all files available file from dir / is senderList available read corosponding intf and send data
const fetchDir = async (path, sender = null) => {
  let fileList;
  if (sender) {
    const fileArr = await readFolder(path, "intf");
    if (sender.length > 0) {
      fileList = fileArr.filter((file) => sender.includes(file.sender));
    } else {
      return fileArr;
    }
  } else if (path.includes("sflow")) {
    return await readFolder(path, "sflow");
  } else if (path.includes("netflow")) {
    return await readFolder(path, "netflow");
  }
  const options = {
    delimiter: ",",
    quote: null,
    ignoreEmpty: true,
    trim: true,
  };
  if (fileList.length == 0) {
    return;
  }
  const results = await Promise.all(
    fileList.map(async (file) => {
      const content = await readFile(file, options);
      return content;
    })
  );
  const obj = results.reduce((ass, cur) => {
    return { ...ass, ...cur };
  }, {});
  return obj;
};

//read all files from folder and filter
const readFolder = (folderPath, filter) => {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      const fileNames = files.filter((file) => {
        return file.includes(filter);
      });
      const filesArr = Promise.all(
        fileNames.map(async (name) => {
          return await new Promise((resolve, reject) => {
            fs.stat(`${folderPath}/${name}`, "utf8", (err, data) => {
              if (err) return "";
              resolve({
                path: `${folderPath}/${name}`,
                filename: name,
                date: data.mtime,
                sender: name.split(/[-.]/)[1].replaceAll("_", "."),
              });
            });
          });
        })
      );
      resolve(filesArr);
    });
  });
};

//read file and send file obj
const readFile = async (file, options) => {
  let data = [];
  let obj = {};
  const resoult = await new Promise((resolve, reject) => {
    fs.createReadStream(file.path)
      .pipe(fastCsv.parse(options))
      .on("error", (error) => {
        reject(error);
      })
      .on("data", async (row) => {
        data.push(row);
      })
      .on("end", (rowCount) => {
        obj[file.sender] = {
          data,
          creationDate: file.date,
          filename: file.filename,
        };
        resolve(obj);
      });
  });
  return resoult;
};

//read all sended files and send back fileObj
const readAllFileServer = async (AllFiles) => {
  const results = await Promise.all(
    AllFiles.map(async (file) => {
      return await fastCsvFileToArray(file);
    })
  );

  return results;
};

//check ip host
const checkIp = async (ip) => {
  return await new Promise((resolve, reject) => {
    dnsPromises.reverse(ip, (err, domains) => {
      if (err) {
        return resolve("");
      }
      const hostname = domains[0];
      return resolve(hostname);
    });
  });
};

module.exports = {
  checkIp,
  fetchDir,
  readAllFileServer,
  readSendersNames,
};
