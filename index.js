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
      `<li>Ticker Symbol:
       <li class='alignRight slide-left'>${tickerSymbol}
       <li class='slide-right'>Price per share:
       <li class='alignRight slide-left'>$${tickerclosePrice}
       <li class='slide-right'>Current Dividend: 
       <li class='alignRight slide-left'>$${dividendPrice}
       <li class='slide-right'>Number of shares: 
       <li class='alignRight slide-left'>${shares}
       <li class='slide-right'>Quarterly return: 
       <li class='alignRight slide-left'>$${quarterlyReturn}
       <li class='slide-right'>Annual return: 
       <li class='alignRight slide-left'>$${annualReturn}
       </li>`     
    )
      //display the results section  
  $('#results').removeClass('hidden');
}

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

//Submit listener for ticker symbol and investment amount
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    let investAmount = $('#js-max-results').val();
    investAmount = parseFloat(investAmount.replace(/\$|,/g, ''))
    console.log(investAmount)
    getStockResults(searchTerm, investAmount);
  });
}

//This is the currency modifier
$("input[data-type='currency']").on({
  keyup: function() {
    formatCurrency($(this));
  },
  blur: function() { 
    formatCurrency($(this), "blur");
  }
});


function formatNumber(n) {
// format number 1000000 to 1,234,567
return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}


function formatCurrency(input, blur) {
// appends $ to value, validates decimal side
// and puts cursor back in right position.

// get input value
var input_val = input.val();

// don't validate empty input
if (input_val === "") { return; }

// original length
var original_len = input_val.length;

// initial caret position 
var caret_pos = input.prop("selectionStart");
  
// check for decimal
if (input_val.indexOf(".") >= 0) {

  // get position of first decimal
  // this prevents multiple decimals from
  // being entered
  var decimal_pos = input_val.indexOf(".");

  // split number by decimal point
  var left_side = input_val.substring(0, decimal_pos);
  var right_side = input_val.substring(decimal_pos);

  // add commas to left side of number
  left_side = formatNumber(left_side);

  // validate right side
  right_side = formatNumber(right_side);
  
  // On blur make sure 2 numbers after decimal
  if (blur === "blur") {
    right_side += "00";
  }
  
  // Limit decimal to only 2 digits
  right_side = right_side.substring(0, 2);

  // join number by .
  input_val = "$" + left_side + "." + right_side;

} else {
  // no decimal entered
  // add commas to number
  // remove all non-digits
  input_val = formatNumber(input_val);
  input_val = "$" + input_val;
  
  // final formatting
  if (blur === "blur") {
    input_val += ".00";
  }
}

// send updated string to input
input.val(input_val);

// put caret back in the right position
var updated_len = input_val.length;
caret_pos = updated_len - original_len + caret_pos;
input[0].setSelectionRange(caret_pos, caret_pos);
}

function initializeUI() {
    watchForm()
    //tickerSymbolChange()
}

//run submit listener
$(initializeUI);
