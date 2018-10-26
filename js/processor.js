// Initialize variables.
let currentFiles = {};

// @todo Replace with localStorage.
let orgLevelHeaders = ['Senior','Parent','Department','Subunit'];

// Config object needed for the Papa parser.
const parseConfig = {
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
};

/**
 * Handle file changes when they update.
 *
 * @todo this could probably be removed.
 */
function updateFile() {
  currentFiles = uploadFile.files;
}

/**
 * Handle submission of the form.
 */
function submitData() {

  // Get headers from input.
  orgLevelHeaders = document.getElementById('org_level_headers').value.split(',');

  // Handle any errors.
  // @todo Make this an early exit.
  handleErrors(currentFiles, orgLevelHeaders);

  // Parse the file handled separately in a callback.
  Papa.parse(currentFiles[0], parseConfig);
}

/**
 * Callback for parsing the CSV file.
 *
 * @param results
 * @param file
 */
function compileResults(results, file) {
  console.log("Parsing complete:", results, file);

  // Cut the data headers from the levels.
  // Length will be the number of columns needed to determine hierarchy.
  const dataHeaders = results.meta.fields.splice(orgLevelHeaders.length);

  let finalData = {};
  let i = 0;
  let varString = 'finalData';
  let data = {};
  let lastOrgName = '';
  results.data.forEach(function (el) {
    try {
      for (i = 0; i < orgLevelHeaders.length; i++) {

        // If header value is blank, then it is a parent of something.
        if (el[orgLevelHeaders[i]] === '') {
          eval(varString + " = {}");
          eval(varString + ".data = {}");
          eval(varString + ".children = {}");

          // Gather data.
          data = {};
          dataHeaders.forEach(function (header, ind) {
            data[header] = el[header];
          });

          eval(varString + ".data = " + JSON.stringify(data) + ';');
          break;
        }

        if (i === orgLevelHeaders.length - 1) {
          varString += '["' + el[orgLevelHeaders[i]] + '"]';
          eval(varString + " = {}");
          eval(varString + ".data = {}");
          eval(varString + ".children = {}");

          // Gather data.
          data = {};
          dataHeaders.forEach(function (header, ind) {
            data[header] = el[header];
          });

          eval(varString + ".data = " + JSON.stringify(data) + ';');
          break;
        }

        // If it isn't blank, then add it to the variable string.
        if (i === 0) {
          varString += '["' + el[orgLevelHeaders[i]] + '"]';
        } else {
          varString += '.children["' + el[orgLevelHeaders[i]] + '"]';
        }

        lastOrgName = el[orgLevelHeaders[i]];
      }
    }
    catch {
      // Send message of last orgname that failed the parsing.
      document.getElementById('messages').innerText = 'Parsing CSV file failed. Last Org parsed: ' + lastOrgName;
    }

    // Reset variable string for next row.
    varString = 'finalData';
  });

  // Trigger download.
  downloadFile(finalData);
}

/**
 * Handle errors if the file or headers aren't included.
 *
 * @param currentFiles
 * @param orgLevelHeaders
 */
function handleErrors(currentFiles, orgLevelHeaders) {
  // if (currentFiles.length === 0) {
  //   document.getElementById('errors').innerText = 'Select a file!';
  //   return;
  // } else {
  //   document.getElementById('errors').innerText = '';
  // }

  return null;
}

/**
 * Downloads a file via the browser. Called from Papa Parse callback.
 *
 * @param finalData
 */
function downloadFile(finalData) {
  const data = new Blob([JSON.stringify(finalData, null, 2)], {type : 'application/json'});

  if (navigator.msSaveBlob) {
    // IE 10+.
    navigator.msSaveBlob(data, 'directory.json');
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // Feature detection for Browsers that support HTML5 download attribute.
      const url = URL.createObjectURL(data);
      link.setAttribute('href', url);
      link.setAttribute('download', 'directory.json');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
