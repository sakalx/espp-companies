console.time('executing :');

// DEPENDENCIES :
const axios = require('axios');
const parse = require('node-html-parser')['parse'];
const fs = require('fs');

// CONFIGURATION :
const FORM_TYPE = 'FormS8';
const PAGES = 4000;
const PER_PAGE = 100;
const SEARCH_TEXT = encodeURIComponent(`"Employee Stock Purchase Plan"`);

// AJAX :
const url = startDoc =>
    `https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp?search_text=${SEARCH_TEXT}&sort=Date&startDoc=${startDoc}&numResults=${PER_PAGE}&isAdv=true&formType=${FORM_TYPE}&fromDate=mm/dd/yyyy&toDate=mm/dd/yyyy&stemming=true`;

axios.all(requests()).
    then(parseData).
    then(save).
    catch(error => console.error('api error :', error));


// HANDLERS :
// Send requests :
function requests() {
  const promises = [];

  for (let step = 1; step <= PAGES; step += PER_PAGE) {
    promises.push(axios.get(url(step)));
  }

  return promises;
}

// Parse response - HTML :
function parseData(response) {
  const companiesName = [];

  response.forEach(({data}) => {
    const root = parse(data);
    const companiesPerPage = root.querySelectorAll('.normalbold').
        map(el => el.rawText);

    companiesName.push(...companiesPerPage.slice(2, -2));
  });

  return companiesName;
}

// Save data into file:
function save(data, fileName = 'companies') {
  const uniq = [...new Set([...data])];

  fs.writeFile(`${fileName}.txt`, uniq.join('\r\n'),
      err => {
        if (err) return console.log(err);
        console.log('The file was saved!');
      });

  console.log('all :', data.length);
  console.log('uniq :', uniq.length);
  console.timeEnd('executing :');
}