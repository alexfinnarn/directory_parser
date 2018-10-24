var currentFiles = {};
var parsedData = {};

var parseConfig = {
  delimiter: ",",
  newline: "",	// auto-detect
  quoteChar: '"',
  escapeChar: '"',
  header: true,
  trimHeaders: false,
  dynamicTyping: false,
  preview: 0,
  encoding: "",
  worker: false,
  comments: false,
  step: undefined,
  complete: compileResults,
  error: undefined,
  download: false,
  skipEmptyLines: false,
  chunk: undefined,
  fastMode: undefined,
  beforeFirstChunk: undefined,
  withCredentials: undefined,
  transform: undefined
}

function submitData() {
  parsedData = Papa.parse(currentFiles[0], parseConfig);
}

function updateFile() {
  currentFiles = input.files;
  console.log(currentFiles);
}

function compileResults(results, file) {
  console.log("Parsing complete:", results, file);
}


