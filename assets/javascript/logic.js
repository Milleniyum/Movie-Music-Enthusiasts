var term;
var genre;
var queryURL;
var page = 1;
var totalPages;
var song = document.createElement("audio");
var file = "https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/Music/v4/dc/8b/a8/dc8ba869-69c7-7d29-f108-b7540c938139/mzaf_811735733402692469.plus.aac.p.m4a";

function displayMovies(response) {

    var pDiv = $("<p>");
    pDiv.html("Please Select the Movie You Intended to Search for:<br>");
    $("#display-area").append(pDiv);
    console.log(response.results.length);
    for (var i = 0; i < response.results.length; i++) {

        var imgURL = response.results[i].poster_path;
        if (imgURL) {
            imgURL = "https://image.tmdb.org/t/p/original/" + imgURL
            var image = $("<img class='img-fluid' alt='Image Unavailable'>").attr("src", imgURL);
            var movieDiv = $("<div class='movie'>");
            movieDiv.attr("data-title", response.results[i].title);
            movieDiv.append(image);
            movieDiv.hide();
            $("#display-area").append(movieDiv);
        };
    };
    $(".movie").fadeIn("slow", function () {
        // Animation complete
    });
};

function getMovieSoundtrack() {
    term = $(this).attr("data-title");
    queryURL = "https://itunes.apple.com/search?term=" + term.replace(/\W+/g, '+').toLowerCase() + "&limit=200&media=music&entity=album&country=us&genreId=16";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: 'JSON'
    }).then(function (response) {
        console.log(response);
        displayMovieSoundtrack(response)
    });
};

function displayMovieSoundtrack(response) {
    var soundtracks = response.results;
    var albums = { albumID: [], artwork: [] };
    for (var i = 0; i < soundtracks.length; i++) {
        if (soundtracks[i].collectionName.includes(term) && soundtracks[i].primaryGenreName === "Soundtrack" && soundtracks[i].trackCount > 1) {
            albums.albumID.push(soundtracks[i].collectionId);
            albums.artwork.push(soundtracks[i].artworkUrl100.replace("100x100", "600x600"));
        }
    }

    if (albums.albumID.length > 0) {
        var collectionIDS = albums.albumID[0].toString();
        for (var i = 1; i < albums.albumID.length; i++) {
            collectionIDS += "," + albums.albumID[i].toString();
        };
        console.log(collectionIDS);

        queryURL = "https://itunes.apple.com/lookup?id=" + collectionIDS + "&entity=song";

        $.ajax({
            url: queryURL,
            method: "GET",
            dataType: 'JSON'
        }).then(function (response) {
            console.log(response);
        });
    };

};

function searchTMDB() {
    var queryURL = "https://api.themoviedb.org/3/search/movie?api_key=cb56eb197668ef66bec1c2c9f31d14e0&query=" + term + "&adult=false&page=" + page;

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: 'JSON'
    }).then(function (response) {
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

$("#searchButton").on("click", function (event) {
    event.preventDefault();
    term = $("#searchTerm").val().trim();
    term = term.replace(/\W+/g, '+').toLowerCase();
    $("#display-area").empty();

    switch ($("#searchBy").val()) {
        case "Movie":
            page = 1; // start on page one of possible movie search results
            searchTMDB();
            break;
    };

});

$(document).on("click", ".movie", getMovieSoundtrack);

// $("#play").on("click", function () {
//     song.setAttribute("src", file);
//     song.play();
// })

// displayMusicInfo();