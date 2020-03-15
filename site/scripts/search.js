// Update this variable to point to your domain.
var apigatewayendpoint =
  'https://6wvqy6w5tg.execute-api.us-east-2.amazonaws.com/search-es-api-test';
var loadingdiv = $('#loading');
var noresults = $('#noresults');
var resultdiv = $('#results');
var searchbox = $('input#search');
var searchsubmit = $('a.search-submit');
var timer = 0;

// get URL parammetes
var urlQuery = getUrlParameter('q') || '';

// apply search by URL params
if (urlQuery) {
  searchbox.val(urlQuery);
  search();
}

// Executes the search function 250 milliseconds after user stops typing
// searchbox.keyup(function(e) {
//   clearTimeout(timer);
//   timer = setTimeout(search, 250);
// });

searchbox.keyup(function(e) {
  if (e.keyCode == 13) {
    search();
  }
});
searchsubmit.click(function() {
  search();
});

async function search() {
  // Clear results before searching
  noresults.hide();
  resultdiv.empty();
  loadingdiv.show();
  // Get the query from the user
  let query = searchbox.val();

  // Only run a query if the string contains at least three characters
  if (query.length > 0) {
    // Make the HTTP request with the query as a parameter and wait for the JSON results
    let response = await $.get(
      apigatewayendpoint,
      { q: query, size: 10 },
      'json'
    );

    // Get the part of the JSON response that we care about
    let results = response.hits.hits;

    if (results.length > 0) {
      loadingdiv.hide();
      // Iterate through the results and write them to HTML
      resultdiv.append(
        '<div class="search-results-count">Top ' +
          results.length +
          ' results:</div>'
      );
      for (var item in results) {
        let score = results[item]._score;
        let url = results[item]._source.url;
        let sort = results[item]._source.sort;
        let title = results[item]._source.title;
        let upvotes = results[item]._source.upvotes;
        let downvotes = results[item]._source.downvotes;
        let description = results[item]._source.description.substring(0, 400);
        let image = 'images/no-image.png';

        // Construct the full HTML string that we want to append to the div

        resultdiv.append(
          `<div class="search-results-list-item"> 
            <div class="search-results-list-item-title">
              <a href="${url}"
                >${title}</a
              >
            </div>
            <div class="search-results-list-item-link">
              <a href="${url}">${url}</a>
            </div>
            <div class="search-results-list-item-content">
              ${description}
            </div>
            <div class="search-results-list-item-info flexible">
              <div class="upvotes">
                <span>${upvotes} </span> upvotes
              </div>
              
              <div class="score">
                ${score} score
              </div>
            </div>
          </div>`
        );
      }
    } else {
      noresults.show();
    }
  }
  loadingdiv.hide();

  // append query to URL
  window.history.pushState(null, null, `?q=${query}`);
}

// Get Parameters from URL
function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
}

// Mobile Menu
$('.hamburger').click(function() {
  $(this).toggleClass('is-active');
  if ($(this).hasClass('is-active')) {
    $('.menu').addClass('active');
  } else {
    $('.menu').removeClass('active');
  }
});