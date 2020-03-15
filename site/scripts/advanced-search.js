// Update this variable to point to your domain.
var apigatewayendpoint =
  'https://9v897cl6g5.execute-api.us-east-2.amazonaws.com/search-2-es-api-test';
var loadingdiv = $('#loading');
var noresults = $('#noresults');
var resultdiv = $('#results');
var searchbox = $('input#search');
var searchsubmit = $('a.search-submit');
var showMoreBtn = $('#show-more-btn');
var timer = 0;
var querySize = 10;
var queryFrom = 0;
var currentPage = 1;
var axisNum = 0;

// get URL parammetes
var urlQuery = getUrlParameter('q') || '';
var urlType = getUrlParameter('s') || 'Top';
var urlInterval = getUrlParameter('t') || 'All Time';
var urlAxis = getUrlParameter('a') || 'Upvote / Downvote';

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
    currentPage = 1;
    queryFrom = 0;
    search();
  }
});
searchsubmit.click(function() {
  queryFrom = 0;
  currentPage = 1;
  search();
});

async function search() {
  // Clear results before searching
  noresults.hide();
  loadingdiv.show();
  searchbox.blur();

  //clear results list for new search
  if (currentPage === 1) {
    resultdiv.empty();
  }
  // Get the query from the user
  let query = searchbox.val().trim().toLowerCase() || ' ';
  let type = urlType.toLowerCase();
  let interval = urlInterval.toLowerCase();
  let axis = urlAxis.toLowerCase();

  // Only run a query if the string contains at least three characters
  if (query.length > 0) {
    // Make the HTTP request with the query as a parameter and wait for the JSON results
    let response = await $.get(
      apigatewayendpoint,
      {
        q: query,
        s: type,
        t: interval,
        a: axis,
        from: queryFrom,
        size: querySize
      },

      'json'
    );

    // Get the part of the JSON response that we care about
    let results = response.hits.hits;

    if (results.length > 0) {
      loadingdiv.hide();
      // Iterate through the results and write them to HTML

      // Append results divider
      if (currentPage > 1) {
        resultdiv.append(
          `<div class="results-sep"><span class="page">${currentPage}</span></div>`
        );
      }

      for (var item in results) {
        //let url = 'https://www.imdb.com/title/' + results[item]._id;
        //let top = results[item]._source.axis_0_top;
        //let controversial = results[item]._source.axis_0_controversial;
		let rid = results[item]._id
        let score = results[item]._score;
        let url = results[item]._source.url;
        let sort = results[item]._source.sort;
        let title = results[item]._source.title;
        let date = new Date(results[item]._source.date);
        let dateOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        let upvotes = results[item]._source['axis_' + axisNum + '_upvotes'];
        let downvotes = results[item]._source['axis_' + axisNum + '_downvotes'];
        let description = results[item]._source.description.substring(0, 400);
        let image = 'images/no-image.png';
        let upIcon = $('.nice-select .current img').attr('src');
        let downIcon = $('.nice-select .current img:last-child').attr('src');

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
              ${date.toLocaleDateString('en-US', dateOptions)} &#8212 ${description}
            </div>
            <div class="search-results-list-item-info flexible">
              <div class="upvotes">
                <img draggable="false" class="emoji" src="${upIcon}"><span>${upvotes}</span>
              </div>
              <div class="downvotes">
                <img draggable="false" class="emoji" src="${downIcon}"><span>${downvotes}</span>
              </div>
              <div class="score">
                ${score} score ${rid} id
              </div>
            </div>
          </div>`
        );
      }
	  //${top} top ${controversial} controversial ${score} score
      // Append "Show more results" Button
      if (results.length === querySize) {
        resultdiv.append(
          '<div class="more-results-wrapper text-center"><a href="#" class="btn" id="show-more-btn">Show more results</a></div>'
        );
      }
    } else {
      noresults.show();
    }
  }
  loadingdiv.hide();

  // append query to URL
  window.history.pushState(
    null,
    null,
    `?q=${query}&s=${type}&t=${interval}&a=${axis}`
  );

  // Show/hide Clear Filters button
  clrFiltersBtn();
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

$(document).ready(function() {
  $('#filter-type option[value="' + urlType + '"]').prop('selected', true);
  $('#filter-interval option[value="' + urlInterval + '"]').prop(
    'selected',
    true
  );
  $('#filter-emoji option[value="' + urlAxis + '"]').prop('selected', true);

  $('select').niceSelect();

  // Makes twitter emojis appear
  // var emojidiv = document.createElement('emojidiv');
  // document.body.appendChild(emojidiv);
  twemoji.parse(document.body);
  emojiHoverUpdate();
});

$('#filter-type').change(function() {
  urlType = $(this).val();
  queryFrom = 0;
  currentPage = 1;
  search();
});
$('#filter-interval').change(function() {
  urlInterval = $(this).val();
  queryFrom = 0;
  currentPage = 1;
  search();
});
$('#filter-emoji').change(function() {
  $(this).niceSelect('update');
  urlAxis = $(this).val();
  axisNum = $(this)
    .children('option:selected')
    .data('axis');
  twemoji.parse(document.body);
  queryFrom = 0;
  currentPage = 1;
  search();
  emojiHoverUpdate();
});

// Show/hide emoji axis text explanation
function emojiHoverUpdate() {
  $('.search-filter-emoji .option').on('mouseenter', function(e) {
    $(this).append(
      '<div class="option-description">' + $(this).data('value') + '</div>'
    );
  });
  $('.search-filter-emoji .option').on('mouseleave', function(e) {
    $(this)
      .find('.option-description')
      .remove();
  });
}

// Reset filters to defaults
$('.clear-filter').click(function(e) {
  e.preventDefault();

  // set default search parameters
  urlType = 'Top';
  urlInterval = 'All Time';
  urlAxis = 'Upvote / Downvote';
  currentPage = 1;
  queryFrom = 0;

  // apply search params to dropdowns
  $('#filter-type option[value="' + urlType + '"]').prop('selected', true);
  $('#filter-interval option[value="' + urlInterval + '"]').prop(
    'selected',
    true
  );
  $('#filter-emoji option[value="' + urlAxis + '"]').prop('selected', true);

  // update view
  $('select').niceSelect('update');
  twemoji.parse(document.body);

  //search with default parameters
  search();
});

// Show/hide Clear filter button
function clrFiltersBtn() {
  var clearfilters = $('a.clear-filter');

  if (
    urlType != 'Top' ||
    urlInterval != 'All Time' ||
    urlAxis != 'Upvote / Downvote'
  ) {
    clearfilters.fadeIn();
  } else {
    clearfilters.hide();
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

// Show more results handler

$('.search-results-list').on('click', showMoreBtn, function(e) {
  e.preventDefault();
  currentPage++;
  queryFrom = currentPage * querySize;
  $('#show-more-btn')
    .hide()
    .remove();
  search();
});