'use strict';

// Params for API calls
const apiKey = 'KQPRIJC81P3ESJF4'; 
const searchURL = 'https://www.alphavantage.co/query';
const tickerApiFunction = 'SYMBOL_SEARCH';
const tickerSymbol = '1. symbol';
const tickerSeries = 'bestMatches';
const tickerName = '2. name';
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

  // generate HTML list with variables
    $('#results-list').append(
      `<li><h3 class='upperCase'>Ticker Symbol: ${tickerSymbol}</h3>
       <li><h3 class='upperCase'>Price per share: $${tickerclosePrice}</h3>
       <li><h3 class='upperCase'>Current Dividend: $${dividendPrice}</h3>
       <li><h3 class='upperCase'>Number of shares: ${shares}</h3>
       <li><h3 class='upperCase'>Quarterly return: $${quarterlyReturn}</h3>
       <li><h3 class='upperCase'>Annual return: $${annualReturn}</h3>
       </li>`     
    )
      //display the results section  
  $('#results').removeClass('hidden');
}

/* Need paid API 
function displaySearchList(responseJson) {
    $('#search-list').empty();
    $('#search-list').append(
        `<li>${responseJson[tickerSeries][0][tickerSymbol]}               ${responseJson[tickerSeries][0][tickerName]}
         <li>${responseJson[tickerSeries][1][tickerSymbol]}               ${responseJson[tickerSeries][1][tickerName]}
         <li>${responseJson[tickerSeries][2][tickerSymbol]}               ${responseJson[tickerSeries][2][tickerName]}
         <li>${responseJson[tickerSeries][3][tickerSymbol]}               ${responseJson[tickerSeries][3][tickerName]} 
         <li>${responseJson[tickerSeries][4][tickerSymbol]}               ${responseJson[tickerSeries][4][tickerName]}</li>`
    )
}*/

//send fetch request to API with params
function queryAPI(params) {
    params.apikey = apiKey
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;

    return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
}

  //API fetch for stock div information
function getStockResults(query, investAmount) {
  const params = {
    function: apiFunction,
    symbol: query
  };

    queryAPI(params)
    .then(responseJson => displayResults(responseJson, investAmount))
    .catch(err => {
        console.log(err)
        console.log(err.message)
        if (err.message == `Cannot read property '7. dividend amount' of undefined`) {
            err.message = `This stock does not pay dividends.`}

        else if (err.message == `Cannot convert undefined or null to object`) {
            err.message = `This is not a valid stock ticker.`}
      
      $('#results').addClass('hidden')      
      $('#js-error-message').text(`${err.message}`);
    });
}

/* Need paid API 
//API fetch for ticker search
function getTickerSymbol(inputQuery){
    const params = {
        function: tickerApiFunction,
        keywords: inputQuery,
    }
    queryAPI(params)
    .then(responseJson => displaySearchList(responseJson))
    .catch(err => {
        $('#js-error-message').empty();
        console.log(err)
        console.log(err.message)
        $('#js-error-message').text('This is not a valid stock ticker.')
    });
}
*/

//Submit listener for ticker symbol and investment amount
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    const investAmount = $('#js-max-results').val();
    getStockResults(searchTerm, investAmount);
  });
}

/* Need paid API 
//listener for ticker symbol field to populate text
function tickerSymbolChange() {
    $('#js-search-term').on('input', event => {
        const tickerTerm = $('#js-search-term').val();
        getTickerSymbol(tickerTerm);
    });
}
*/

function initializeUI() {
    watchForm()
    //tickerSymbolChange()
}

//run submit listener
$(initializeUI);
