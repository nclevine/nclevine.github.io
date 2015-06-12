var $githubSearch;
var $searchBar;
var $resultsContainer;
var $overlayContainer;
var $loading;
var cache = {};

$(document).ready(function(){
  $githubSearch = $('#github-search')
  $searchBar = $('#search-bar');
  $resultsContainer = $('#results-container');
  $overlayContainer = $('#overlay-container');
  $loading = $('#loading');

  $githubSearch.on('submit', function(event){
    event.preventDefault();
    $overlayContainer.css('display', 'none');
    var searchTerm = $searchBar.val();
    if(cache[searchTerm]){
      formatResults(searchTerm, cache[searchTerm]);
    } else{
      var searchURL = 'https://api.github.com/search/repositories?q=' + searchTerm;
      $.ajax({
        method: 'get',
        dataType: 'json',
        url: searchURL,
        beforeSend: loadingBegin,
        complete: loadingEnd
      }).done(function(response){
        if(response.total_count == 0){
          $resultsContainer.html("<h2 id='no-results'>No results</h2>")
        } else{
          var items = response.items;
          cache[searchTerm] = items;
          formatResults(searchTerm, items);
        };
      });
    }
  });
});

function formatResults(searchTerm, results){
  $resultsContainer.html("<h2 class='search-title'>Results for <span>" + searchTerm + "</span></h2>");
  for (var i = 0; i < results.length; i++) {
    var $result = $("<div id='" + results[i].id
      + "' class='result'><h3>"
      + results[i].name + " <span class='owner'>("
      + results[i].owner.login + ")</span></h3></div>"
    );
    $result.on('click', results[i], formatDetails)
    $resultsContainer.append($result);
  };
}

function formatDetails(event){
  if(!event.data.description){
    event.data.description = 'No description.';
  };
  if(!event.data.language){
    event.data.language = 'no language specified';
  };
  if(event.data.watchers == 1){
    var label = 'follower'
  } else{
    var label = 'followers'
  };
  $overlayContainer.html("<h3>" + event.data.name
    + " <span class='owner'>by " + event.data.owner.login
    + "</span></h3><p class='description'>" + event.data.description
    + " <span>(" + event.data.language
    + ")</span></p><p>" + event.data.watchers + " " + label
    + "</p><p class='repo-link'><a target='_blank' href='"
    + event.data.html_url + "'>"
    + event.data.html_url + "</a></p>"
  );
  $close = $("<p class='close'><a href=''>Close</a></p>");
  $close.on('click', function(event){
    event.preventDefault();
    $overlayContainer.css('display', 'none');
  });
  $overlayContainer.append($close);
  $overlayContainer.css('display', 'block');
}

function loadingBegin(){
  $loading.css('display', 'block');
}

function loadingEnd(){
  $loading.css('display', 'none');
}
