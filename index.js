'use strict';

// put your own value below!
const apiKey = 'KQPRIJC81P3ESJF4'; 
const searchURL = 'https://www.alphavantage.co/query';
const meta = 'Meta Data';
const apiFunction = 'TIME_SERIES_MONTHLY_ADJUSTED';
const series = 'Monthly Adjusted Time Series';
const symbol = '2. Symbol';
const closePrice = '4. close';
let dividendAmount = '7. dividend amount';

//Create API URL
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

//function to find first instance of a dividend > 0
function currentDiv(apiSeries){
    let startDate = 0
    let dates = Object.keys(apiSeries)
    let dateData = apiSeries[dates[startDate]]
    console.log(dateData)

    //while loop
    while (dateData[dividendAmount] == 0.0000) { //delibritaly coercing to number
        //goto next date
        startDate++
        dateData = apiSeries[dates[startDate]]
    }   
    console.log(dateData)
        return dateData

};

//Display results of fetch and calculations
function displayResults(responseJson, investAmount) {
  // if there are previous results, remove them
  $('#results-list').empty();
  $('#js-error-message').empty();

const divPrice = currentDiv(responseJson[series])

let tickerSymbol = `${responseJson[meta][symbol]}`
let tickerclosePrice = `${parseFloat(divPrice[closePrice]).toFixed(2)}`
let dividendPrice = `${divPrice[dividendAmount]}`
let shares = `${(investAmount/divPrice[closePrice]).toFixed(2)}`
let quarterlyReturn = `${parseFloat(shares*dividendPrice).toFixed(2)}`
let annualReturn = `${parseFloat(quarterlyReturn*4).toFixed(2)}`

//currentDiv(dividendPrice);

  // generate HTML list with variables
    $('#results-list').append(
      `<li><h3 class='upperCase'>Ticker Symbol: ${tickerSymbol}</h3>
       <li><h3 class='upperCase'>Price per share: $${tickerclosePrice}</h3>
       <li><h3 class='upperCase'>Current Dividend: $${dividendPrice}</h3>
       <li><h3 class='upperCase'>How many shares you can afford: ${shares}</h3>
       <li><h3 class='upperCase'>Quarterly return: $${quarterlyReturn}</h3>
       <li><h3 class='upperCase'>Annual return: $${annualReturn}</h3>
       </li>`     
    )
};

  //display the results section  
  $('#results').removeClass('hidden');

  //API fetch function using params
function getStockResults(query, investAmount) {
  const params = {
    apikey: apiKey,
    function: apiFunction,
    symbol: query
  };
  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson, investAmount))
    .catch(err => {
        console.log(err)
        console.log(err.message)
        if (err.message == `Cannot read property '7. dividend amount' of undefined`) {
            err.message = `This stock does not pay dividends.`}

        else if (err.message == `Cannot convert undefined or null to object`) {
            err.message = `This is not a valid stock ticker.`}

      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//Submit listener for ticker symbol and investment amount
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    const investAmount = $('#js-max-results').val();
    getStockResults(searchTerm, investAmount);
  });
}

//run submit listener
$(watchForm);
