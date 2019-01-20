var term;
var genre;
var queryURL;
var page = 1;
var totalPages;
var song = document.createElement("audio");
var file = "https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/Music/v4/dc/8b/a8/dc8ba869-69c7-7d29-f108-b7540c938139/mzaf_811735733402692469.plus.aac.p.m4a";

function searchiTunes() {
    queryURL = "https://itunes.apple.com/search?term=original+motion+picture+soundtrack+" + term + "&limit=200";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: 'JSON'
    }).then(function(response) {
        console.log(response);
    });
};

function displayMovies(response) {

    var pDiv = $("<p>");
    pDiv.html("Please Select the Movie You Intended to Search for:<br>");
    $("#display-area").append(pDiv);
    console.log(response.results.length);
    for (var i = 0; i < response.results.length; i++) {
        console.log(i);
        var movieDiv = $("<div class='movie'>");
        var imgURL = response.results[i].poster_path;
        if (imgURL) {
            imgURL = "https://image.tmdb.org/t/p/original/" + imgURL
        };
        console.log(imgURL);
        var image = $("<img class='img-fluid' alt='Image Unavailable'>").attr("src", imgURL);
        movieDiv.attr("data-title", response.results[i].title);
        movieDiv.append(image);
        movieDiv.hide();
        $("#display-area").append(movieDiv);

    };
    $(".movie").fadeIn("slow", function() {
        // Animation complete
    });
};

function displaySoundtrack() {
    term = $(this).attr("data-title").replace(/\W+/g, '+').toLowerCase();
    queryURL = "https://itunes.apple.com/search?term=" + term + "&limit=200&media=music&entity=album";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: 'JSON'
    }).then(function(response) {
        console.log(response);
    });
};

function searchTMDB() {
    var queryURL = "https://api.themoviedb.org/3/search/movie?api_key=cb56eb197668ef66bec1c2c9f31d14e0&query=" + term + "&adult=false&page=" + page;

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: 'JSON'
    }).then(function(response) {
        console.log(response);
        totalPages = response.total_pages;
        var totalResults = response.total_results;
        if (totalResults === 0) {
            var divP = $("<p>").text("No Results Found");
            $("#display-area").append(divP);
        } else {
            displayMovies(response);
        };
    });
};

$("#searchButton").on("click", function(event) {
    event.preventDefault();
    term = $("#searchTerm").val().trim();
    term = term.replace(/\W+/g, '+').toLowerCase();
    console.log(term);
    $("#display-area").empty();

    switch ($("#searchBy").val()) {
        case "Movie":
            page = 1; // start on page one of possible movie search results
            searchTMDB();
            break;
    };

});

$(document).on("click", ".movie", displaySoundtrack);

// $("#play").on("click", function () {
//     song.setAttribute("src", file);
//     song.play();
// })

// displayMusicInfo();