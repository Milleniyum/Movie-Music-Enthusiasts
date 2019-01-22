var term;
var genre;
var queryURL;
var page = 1;
var totalPages;
var song = document.createElement("audio");
var file = "https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/Music/v4/dc/8b/a8/dc8ba869-69c7-7d29-f108-b7540c938139/mzaf_811735733402692469.plus.aac.p.m4a";

function displayMovies(response) {

    for (var i = 0; i < response.results.length; i++) {

        var imgURL = response.results[i].poster_path;
        if (imgURL) {
            imgURL = "https://image.tmdb.org/t/p/original/" + imgURL
            var image = $("<img class='img-fluid' alt='Image Unavailable'>").attr("src", imgURL);
            var movieDiv = $("<div class='movie'>");
            movieDiv.attr("data-title", response.results[i].title);
            movieDiv.append(image);
            movieDiv.hide();
            $("#movie-search-movies").append(movieDiv);
        };
    };

    var movieCount = $("#movie-search-movies").children().length;
    if (movieCount > 0) {
        $(".movie-count").text(" - " + movieCount + " movie(s) found");
        $("#movie-search-wrapper").show();
    } else {
        $(".movie-count").text(" - 0 movies found");
    };

    $(".movie").fadeIn("slow", function () {
        //animation complete
    });
};

function getMovieSoundtrack() {
    $(".soundtrack-count").text(" - Searching...");
    $(".movie").attr("style", "border: 1px solid black;");
    $(this).attr("style", "border: 4px solid yellow;");

    $("#movie-search-soundtracks").empty();
    term = $(this).attr("data-title");
    queryURL = "https://itunes.apple.com/search?term=" + term.replace(/\W+/g, '+').toLowerCase() + "&limit=200&media=music&entity=album&country=us&genreId=16";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function (response) {
        console.log(response);
        var soundtracks = response.results;
        var albumIDS = [];
        for (var i = 0; i < soundtracks.length; i++) {
            if (soundtracks[i].collectionName.replace(/,/g, '').includes(term.replace(/,/g, '')) && soundtracks[i].primaryGenreName === "Soundtrack" && soundtracks[i].trackCount > 1) {
                albumIDS.push(soundtracks[i].collectionId);
            }
        }

        if (albumIDS.length > 0) {
            $("#movie-search-soundtracks").empty();
            queryURL = "https://itunes.apple.com/lookup?id=" + albumIDS.toString() + "&entity=song";

            $.ajax({
                url: queryURL,
                method: "GET",
                dataType: "JSON"
            }).then(function (response) {
                console.log(response);
                displayMovieSoundtrack(response)
            });
        } else {
            $('#modal-title').text("Soundtrack(s)");
            $('#modal-message').text("No soundtracks were found for the selected movie.");
            $('#modal-box').modal('show');
            $(".soundtrack-count").text(" - 0 soundtrack(s) found");
        };
    });
};

function displayMovieSoundtrack(response) {
    for (var i = 0; i < response.results.length; i++) {
        if (response.results[i].collectionType === "Album") {
            var imgURL = response.results[i].artworkUrl100.replace("100x100", "200x200");
            if (imgURL) {
                var image = $("<img class='img-fluid' alt='Image Unavailable'>").attr("src", imgURL);
                var soundtrackDiv = $("<div class='movie-soundtrack'>");
                soundtrackDiv.attr("data-id", response.results.collectionId);
                soundtrackDiv.append(image);
                soundtrackDiv.hide();
                $("#movie-search-soundtracks").append(soundtrackDiv);
            };
        }
    }

    var soundTrackCount = $("#movie-search-soundtracks").children().length;
    $(".soundtrack-count").text(" - " + soundTrackCount + " soundtrack(s) found");

    $(".movie-soundtrack").fadeIn("slow", function () {
        // animation complete
    });
};

function displayAlbumTracks() {
    $(".movie-soundtrack").attr("style", "border: 1px solid black;");
    $(this).attr("style", "border: 4px solid yellow;");
};

function resetMovieSearch() {
    $("#movie-search-wrapper").hide();
    $("#movie-search-movies").empty();
    $("#movie-search-soundtracks").empty();
    $(".movie-count").text("");
    $(".soundtrack-count").text("");
}

function searchTMDB() {
    var queryURL = "https://api.themoviedb.org/3/search/movie?api_key=cb56eb197668ef66bec1c2c9f31d14e0&query=" + term + "&adult=false&page=" + page;

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function (response) {
        console.log(response);
        totalPages = response.total_pages;
        var totalResults = response.total_results;
        if (totalResults === 0) {
            $('#modal-title').text("Movie Search");
            $('#modal-message').text("No movies found based on your search.");
            $('#modal-box').modal('show');
        } else {
            displayMovies(response);
        };
    });
};

$("#searchButton").on("click", function (event) {
    event.preventDefault();
    term = $("#searchTerm").val().trim();
    term = term.replace(/\W+/g, '+').toLowerCase();

    switch ($("#searchBy").val()) {
        case "Movie":
            resetMovieSearch();
            page = 1; // start on page one of possible movie search results
            searchTMDB();
            break;
    };

});

$(document).on("click", ".movie", getMovieSoundtrack);
$(document).on("click", ".movie-soundtrack", displayAlbumTracks);

// $("#play").on("click", function () {
//     song.setAttribute("src", file);
//     song.play();
// })

// displayMusicInfo();