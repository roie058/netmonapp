const fs = require("fs");
const fastCsv = require("fast-csv");

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
        await data.push(row);
      })
      .on("end", (rowCount) => {
        obj[file.filename] = data;
        resolve(obj);
      });
  });
  return resoult;
};

//new fast csv reader
const readPortList = async (file) => {
  console.log(file);
  const options = {
    delimiter: ",",
    quote: null,
    ignoreEmpty: true,
    trim: true,
  };

  if (file.length === 0) {
    return;
  }

  const filesArr = file.map((file) => {
    const sender = file.filename.split(/[-.]/)[1].replaceAll("_", ".");

    return { path: file.path, filename: sender };
  });

  const results = await Promise.all(
    filesArr.map(async (file) => {
      const content = await readFile(file, options);
      fs.unlink(file.path, (err) => {
        console.log(err);
      });
      console.log(content);
      return content;
    })
  );
  const obj = results.reduce((ass, cur) => {
    return { ...ass, ...cur };
  }, {});
  return obj;
};

module.exports = { readPortList };
