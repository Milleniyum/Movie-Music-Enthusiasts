// Initialize Firebase
var config = {
    apiKey: "AIzaSyCO0tZ3Krv3d0CynNFNNrA9_-LRR0W7C-A",
    databaseURL: "https://moviemusicenthusiasts.firebaseio.com",
};

firebase.initializeApp(config);
var dbRef = firebase.database().ref("\links");

// var movieLinks = { site: ["The Movie Database", "IMDB", "Rotten Tomatoes", "Fandango", "Screen Rant"], url: ["https://www.themoviedb.org/", "https://www.imdb.com/", "https://www.rottentomatoes.com/", "https://www.fandango.com/"] };
// var musicLinks = { site: ["iTunes/Apple Music", "Spotify", "Pandora", "Soundcloud"], url: ["https://apple.com/itunes", "https://www.spotify.com", "https://www.pandora.com", "https://www.soundcloud.com/", "https://screenrant.com/"] };

// dbRef.set({
//     movies: JSON.stringify(movieLinks),
//     music: JSON.stringify(musicLinks)
// });

var term;
var genre;
var queryURL;
var callCount; //Used when multiple ajax calls are made to TMDB in a music search
var page = 1;
var totalPages;
var songPreview = document.createElement("audio");
var soundtrackSongs = {};
var genres = { "Blues": 2, "Comedy": 3, "Children's Music": 4, "Classical": 5, "Country": 6, "Electronic": 7, "Holiday": 8, "Opera": 9, "Jazz": 11, "Latino": 12, "New Age": 13, "Pop": 14, "R&B/Soul": 15, "Soundtrack": 16, "Dance": 17, "Hip-Hop/Rap": 18, "World": 19, "Alternative": 20, "Rock": 21, "Christian & Gospel": 22, "Vocal": 23, "Reggae": 24, "Easy Listening": 25, "J-Pop": 27, "Anime": 29, "K-Pop": 51, "Instrumental": 53, "Brazillian": 1122, "Disney": 50000063 }

dbRef.on("value", function (snapshot) {
    if (snapshot.val()) {
        movieLinks = JSON.parse(snapshot.val().movies);
        musicLinks = JSON.parse(snapshot.val().music);
        console.log(movieLinks);
        console.log(musicLinks);

        for (var i = 0; i < movieLinks.site.length; i++) {
            var newLI = $("<li><a href=" + movieLinks.url[i] + " target='_blank'>" + movieLinks.site[i] + "</a></li>");
            $("#movie-links").append(newLI);
        };

        for (var i = 0; i < musicLinks.site.length; i++) {
            var newLI = $("<li><a href=" + musicLinks.url[i] + " target='_blank'>" + musicLinks.site[i] + "</a></li>");
            $("#music-links").append(newLI);
        };
    };
});

//Youtube Player Section
//This code loads the IFrame Player API code asynchronously.
function loadYTPlayer() {
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};

//This function creates an <iframe> (and YouTube player) after the API code downloads.
var ytPlayer;

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {});
};

function getYouTube() {

    var term = $(this).attr("data-title");
    var queryURL = "https://cors-anywhere.herokuapp.com/https://www.googleapis.com/youtube/v3/search?part=snippet&q="+term+"&type=playlist&key=AIzaSyCjoCACPpUx6wDvUQVPfuBxwAWDlMwtkyE"

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function (response) {
        console.log(response);
        if (response.items.length > 0) {
            displayYouTube(response.items[0].id.playlistId);
        } else {
            $('#modal-title').text("YouTube Soundtrack");
            $('#modal-message').text("No soundtrack playlist found on YouTube.");
            $('#modal-box').modal('show');
        };
    });
};

function displayYouTube(playListID) {
    ytPlayer.loadPlaylist({
        list: playListID,
        listType: "playlist",
        index: 0,
        startSeconds: 0,
        suggestedQuality: "default"
    });
    $('#modal-youtube').modal('show');
    event.target.playVideo();
}



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
            $("#movie-results").append(movieDiv);
        };
    };

    var movieCount = $("#movie-results").children().length;
    if (movieCount > 0) {
        $(".movie-count").text(" - " + movieCount + " movie(s) found");
    } else {
        if ($("#search-by").val() === "Movie") {
            $(".movie-count").text(" - 0 movies found");
            $('#modal-title').text("Movie Search");
            $('#modal-message').text("No movies found based on your search.");
            $('#modal-box').modal('show');
        };
    };

    $(".movie").fadeIn("slow", function () {
        //animation complete
    });

    anime({
        targets: document.getElementsByClassName("movie"),
        scale: [
            { value: .6, easing: 'easeOutSine', duration: 500 },
            { value: 1, easing: 'easeOutQuad', duration: 1000 },
        ],
    });
};

function getMovieSoundtrack() {
    $(".movie").attr("style", "border: 1px solid black;");
    $(this).attr("style", "border: 4px solid yellow;");

    //Determine if movie is already selected and stop if it is
    if (term === $(this).attr("data-title")) { return false };

    $(".soundtrack-count").text(" - Searching...");

    $("#soundtrack-results").empty();
    $("#soundtrack-table").empty();
    $("#soundtrack-header").text("Soundtrack");
    $("#soundtrack-header").attr("data-id", "");
    $("#suggested-table").empty();

    term = $(this).attr("data-title");
    queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=" + term.replace(/\W+/g, '+').toLowerCase() + "&limit=200&media=music&entity=album&country=us&genreId=" + genres.Soundtrack;
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
            $("#soundtrack-results").empty();
            queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=" + albumIDS.toString() + "&entity=song";

            $.ajax({
                url: queryURL,
                method: "GET",
                dataType: "JSON"
            }).then(function (response) {
                console.log(response);
                displayMovieSoundtrack(response)
            });
        } else {
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
                soundtrackDiv.attr("data-id", response.results[i].collectionId);
                soundtrackDiv.append(image);
                soundtrackDiv.hide();
                $("#soundtrack-results").append(soundtrackDiv);
            };
        }
    }

    var soundTrackCount = $("#soundtrack-results").children().length;
    $(".soundtrack-count").text(" - " + soundTrackCount + " soundtrack(s) found");

    $(".movie-soundtrack").fadeIn("slow", function () {
        // animation complete
    });

    anime({
        targets: '.movie-soundtrack',
        rotate: {
            value: '+=2turn', // 0 + 2 = '2turn'
            duration: 500,
            easing: 'easeInOutSine'
        },
        direction: 'reverse'
    });

    //Store the soundtrack tracks for use in displaySoundtrackSongs function
    soundtrackSongs = response.results;
};

function displaySoundtrackSongs() {
    $(".movie-soundtrack").attr("style", "border: 1px solid black;");
    $(this).attr("style", "border: 4px solid yellow;");

    // Determine if soundtrack is already selected and stop if it is
    if ($("#soundtrack-header").attr("data-id") === $(this).attr("data-id")) { return false };

    $("#soundtrack-table").empty();
    $("#suggested-table").empty();
    var details = { artistID: [], genreNames: [], trackID: [], explicit: "notExplicit" };
    var aid;
    var gn;
    for (var i = 0; i < soundtrackSongs.length; i++) {
        if (soundtrackSongs[i].wrapperType === "track" && soundtrackSongs[i].collectionId.toString() === $(this).attr("data-id")) {
            $("#soundtrack-header").text(soundtrackSongs[i].collectionName);
            $("#youtube-logo").attr("data-title", soundtrackSongs[i].collectionName);
            $("#soundtrack-header").attr("data-id", $(this).attr("data-id"));
            var newTR = $('<tr>');
            newTR.append('<td><img class="play-button" src="assets/images/play.png" data-preview=' + soundtrackSongs[i].previewUrl + '></td>');
            newTR.append('<td>' + soundtrackSongs[i].discNumber + '</td>');
            newTR.append('<td>' + soundtrackSongs[i].trackNumber + '</td>');
            newTR.append('<td>' + soundtrackSongs[i].trackName + '</td>');
            newTR.append('<td><a href=' + soundtrackSongs[i].artistViewUrl + ' target="_blank">' + soundtrackSongs[i].artistName + '</a></td>');
            newTR.append('<td>' + soundtrackSongs[i].primaryGenreName + '</td>');
            $('#soundtrack-table').append(newTR);

            aid = soundtrackSongs[i].artistId;
            if (details.artistID.indexOf(aid) === -1) {
                details.artistID.push(aid);
            };
            gn = soundtrackSongs[i].primaryGenreName;
            if (details.genreNames.indexOf(gn) === -1) {
                details.genreNames.push(gn);
            };
            details.trackID.push(soundtrackSongs[i].trackId);
            details.explicit = soundtrackSongs[i].collectionExplicitness;
        };
    };

    // console.log(details);
    // anime({
    //     targets: this,
    //     rotate: {
    //         value: '+=2turn', // 0 + 2 = '2turn'
    //         duration: 500,
    //         easing: 'easeInOutSine'
    //     },
    //     direction: 'reverse'
    // });

    getSongSuggestions(details);
};

function getSongSuggestions(details) {
    $("#suggested-header").text("Searching...");
    queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=" + details.artistID.toString() + "&media=music&entity=song&country=us";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function (response) {
        console.log(response);
        displaySongSuggestions(response, details);
    });
};

function displaySongSuggestions(response, details) {
    var songs = response.results;
    for (var i = 0; i < songs.length; i++) {
        if (songs[i].wrapperType === "track" && details.trackID.indexOf(songs[i].trackId) === -1) {
            // Add the song to the list only if the explicitness matches (prevents explicit songs being suggested for non-explicit albums)
            if (songs[i].collectionExplicitness === details.explicit) {
                var newTR = $('<tr>');
                newTR.append('<td><img class="play-button" src="assets/images/play.png" data-preview=' + songs[i].previewUrl + '></td>');
                newTR.append('<td>' + songs[i].trackName + '</td>');
                newTR.append('<td><a href=' + songs[i].artistViewUrl + ' target="_blank">' + songs[i].artistName + '</a></td>');
                newTR.append('<td><a href=' + songs[i].collectionViewUrl + ' target="_bank">' + songs[i].collectionName + '</a></td>');
                newTR.append('<td>' + songs[i].primaryGenreName + '</td>');
                $('#suggested-table').append(newTR);
            };
        };
    };
    $("#suggested-header").text("Suggested Music (" + $("#suggested-table").children().length + ")");
};

function getSuggestedMovies(artistResponse, artistGenre) {
    $(".movie-count").text(" - Searching...");

    if ($("#search-by").val() === "Music Genre") {
        queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=soundtrack&limit=200&media=music&entity=song&country=us&genreId=" + genres[$("#search-genre").val()];
    } else { //Searching by music artist
        queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=soundtrack&limit=200&media=music&entity=song&country=us&genreId=" + genres[artistGenre];
    };
    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function (response) {
        console.log(response);

        //Combine response and artistResponse if searching by music artist
        if ($("#search-by").val() === "Music Artist") {
            for (var i = 0; i < artistResponse.results.length; i++) {
                response.results.push(artistResponse.results[i]);
            };
            console.log(response);
        };

        var albumID = [];
        var albums = response.results;

        for (var i = 0; i < albums.length; i++) {
            if (albums[i].wrapperType === "track") {
                if (albumID.indexOf(albums[i].collectionId) === -1) {
                    albumID.push(albums[i].collectionId);
                };
            };
        };
        console.log(albumID);

        queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=" + albumID.toString() + "&entity=song&country=us";
        $.ajax({
            url: queryURL,
            method: "GET",
            dataType: "JSON"
        }).then(function (response) {
            console.log(response);
            var albumID = [];
            var songs = response.results;
            var searchGenre;

            //Sort by Soundtrack if searching by music artist otherwise search by genre selected
            if ($("#search-by").val() === "Music Artist") {
                searchGenre = "Soundtrack";
            } else {
                searchGenre = $("#search-genre").val();
            };

            for (var i = 0; i < songs.length; i++) {
                if (songs[i].wrapperType === "track") {
                    if (songs[i].primaryGenreName === searchGenre) {
                        if (albumID.indexOf(songs[i].collectionId) === -1) {
                            albumID.push(songs[i].collectionId);
                        };
                    };
                };
            };
            console.log(albumID);

            queryURL = queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=" + albumID.toString() + "&entity=album";
            $.ajax({
                url: queryURL,
                method: "GET",
                dataType: "JSON"
            }).then(function (response) {
                console.log(response);
                var albumNames = [];
                var albums = response.results;

                for (var i = 0; i < albums.length; i++) {
                    if (albums[i].wrapperType === "collection" && albums[i].primaryGenreName === "Soundtrack") {
                        if (albumNames.indexOf(albums[i].collectionName) === -1) {
                            albumNames.push(albums[i].collectionName);
                        };
                    };
                };
                console.log(albumNames);
                if (albumNames.length > 0) {
                    displaySuggestedMovies(albumNames);
                } else {
                    $(".movie-count").text(" - 0 movies found");
                    $('#modal-title').text("Music Search");
                    $('#modal-message').text("No movies found based on your search.");
                    $('#modal-box').modal('show');
                };
            });
        });
    });
};

function displaySuggestedMovies(albumNames) {
    var editedAlbumNames = [];
    var editedName;
    for (var i = 0; i < albumNames.length; i++) {
        editedName = albumNames[i].split("(")[0].trim();
        if (editedAlbumNames.indexOf(editedName) === -1) {
            editedAlbumNames.push(editedName);
        };
    };
    console.log(editedAlbumNames);

    callCount = editedAlbumNames.length; //used to display message if no movies were found after the last ajax call has finished
    console.log(callCount);

    for (var i = 0; i < editedAlbumNames.length; i++) {
        var albumName = editedAlbumNames[i];
        var queryURL = "https://api.themoviedb.org/3/search/movie?api_key=cb56eb197668ef66bec1c2c9f31d14e0&query=" + albumName.replace(/\W+/g, '+').toLowerCase() + "&adult=false";

        $.ajax({
            url: queryURL,
            method: "GET",
            dataType: "JSON"
        }).then(function (response) {
            console.log(response);

            displayMovies(response);

            callCount--;
            console.log(callCount);
            if (callCount === 0) {
                if ($("#movie-results").children().length === 0) {
                    $(".movie-count").text(" - 0 movies found");
                    $('#modal-title').text("Music Search");
                    $('#modal-message').text("No movies found based on your search.");
                    $('#modal-box').modal('show');
                };
            };

        });
    };
};

function getArtists() {
    $(".artist-count").text(" - Searching...");
    queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=" + term + "&entity=musicArtist";

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function (response) {
        console.log(response);
        var artistId = [];
        var artists = response.results;
        for (var i = 0; i < artists.length; i++) {
            if (artistId.indexOf(artists[i].artistId) === -1) {
                artistId.push(artists[i].artistId);
            }
        }
        queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=" + artistId.toString() + "&entity=album&media=music&limit=1";
        console.log(queryURL);
        $.ajax({
            url: queryURL,
            method: "GET",
            dataType: "JSON",
        }).then(function (response) {
            console.log(response);
            if (response.results.length > 0) {
                displayArtists(response);
            } else {
                $(".artist-count").text(" - 0 artists found");
                $('#modal-title').text("Music Search");
                $('#modal-message').text("No artists found based on your search.");
                $('#modal-box').modal('show');
            };

        });
    });
};

function displayArtists(response) {
    for (var i = 0; i < response.results.length; i++) {
        if (response.results[i].wrapperType === "collection") {
            var imgURL = response.results[i].artworkUrl100.replace("100x100", "200x200");
            console.log(imgURL);
            if (imgURL) {
                var image = $("<img class='img-fluid' alt='Image Unavailable'>").attr("src", imgURL);
                var albumDiv = $("<div class='artist-album'>");
                albumDiv.attr("data-id", response.results[i].artistId);
                albumDiv.attr("data-name", response.results[i].artistName);
                albumDiv.attr("data-genre", response.results[i].primaryGenreName);
                albumDiv.append(image);
                albumDiv.hide();
                $("#artist-results").append(albumDiv);
            };
        };
    };

    var artistCount = $("#artist-results").children().length;
    $(".artist-count").text(" - " + artistCount + " artist(s) found");

    $(".artist-album").fadeIn("slow", function () {
        // animation complete
    });

    anime({
        targets: '.artist-album',
        rotate: {
            value: '+=2turn', // 0 + 2 = '2turn'
            duration: 500,
            easing: 'easeInOutSine'
        },
        direction: 'reverse'
    });

};

function resetSearch() {
    $("#movie-results").empty();
    $("#soundtrack-results").empty();
    $("#artist-results").empty();
    $(".movie-count").text("");
    $(".artist-count").text("");
    $(".soundtrack-count").text("");
    $("#soundtrack-header").text("Soundtrack");
    $("#soundtrack-header").attr("data-id", "");
    $("#soundtrack-table").empty();
    $("#suggested-table").empty();
};

function searchTMDB() {
    var queryURL = "https://api.themoviedb.org/3/search/movie?api_key=cb56eb197668ef66bec1c2c9f31d14e0&query=" + term + "&adult=false&page=" + page;
    $(".movie-count").text(" - Searching...");
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function (response) {
        console.log(response);
        totalPages = response.total_pages;
        var totalResults = response.total_results;
        if (totalResults === 0) {
            $(".movie-count").text(" - 0 movie(s) found");
            $('#modal-title').text("Movie Search");
            $('#modal-message').text("No movies found based on your search.");
            $('#modal-box').modal('show');
        } else {
            displayMovies(response);
        };
    });
};

$("#search-by").change(function () {
    if ($("#search-by").val() === "Music Genre") {
        $("#genre-group").show();
        $("#search-term").prop("disabled", true);
        $("#search-term").val("");
    } else {
        $("#genre-group").hide();
        $("#search-term").prop("disabled", false);
    };
});

$("#search-button").on("click", function (event) {
    event.preventDefault();
    term = $("#search-term").val().trim();
    term = term.replace(/\W+/g, '+').toLowerCase();

    if (term === "" && $("#search-by").val() != "Music Genre") { return false };


    //Hide the welcome message and show the search results screen
    $("#welcome").hide();
    $("#search-wrapper").show();
    resetSearch();

    switch ($("#search-by").val()) {
        case "Movie":
            $("#artist-results-wrapper").hide();
            page = 1; // start on page one of possible movie search results
            searchTMDB();
            break;
        case "Music Artist":
            $("#artist-results-wrapper").show();
            getArtists();
            break;
        case "Music Genre":
            $("#artist-results-wrapper").hide();
            getSuggestedMovies();
            break;
    };
});

// Search by Movie - begin the process of finding the soundtrack for the selected movie
$(document).on("click", ".movie", getMovieSoundtrack);

// Display the songs for the selected soundtrack
$(document).on("click", ".movie-soundtrack", displaySoundtrackSongs);

$(document).on("click", ".artist-album", function () {
    $(".artist-album").attr("style", "border: 1px solid black;");
    $(this).attr("style", "border: 4px solid yellow;");

    $("#movie-results").empty();
    $(".movie-count").text(" - Searching...");

    var artistID = $(this).attr("data-id");
    var artistName = $(this).attr("data-name").replace(/\W+/g, '+').toLowerCase();
    var artistGenre = $(this).attr("data-genre");

    //Make initial two api calls to get songs based on artist id and then name
    var queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=" + artistID + "&media=music&entity=song&country=us";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function (responseID) {

        queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=" + artistName + "&limit=200&media=music&entity=song&country=us&genreId=" + genres.Soundtrack;
        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET",
            dataType: "JSON"
        }).then(function (responseName) {
            console.log(responseID);
            console.log(responseName);

            //Combine the response objects
            for (var i = 0; i < responseName.results.length; i++) {
                responseID.results.push(responseName.results[i]);
            };
            console.log(responseID);
            //Pass the response and artist genre to the getSuggestedMovies function to make the last call by genre and add that response to the passed response object
            getSuggestedMovies(responseID, artistGenre);
        });
    });
});

$(document).on("click", ".play-button", function () {
    var previewURL = $(this).attr("data-preview");
    if ($(this).attr("src") === "assets/images/play.png") {
        // Pause any current audio and set images back to play
        songPreview.pause();
        $(".play-button").attr("src", "assets/images/play.png");

        // Set the src attribute to the preview URL, change the image to pause, and begin playing
        songPreview.setAttribute("src", previewURL);
        $(this).attr("src", "assets/images/pause.png");
        songPreview.play();

    } else {
        // Pause the music and set image to play
        songPreview.pause();
        $(this).attr("src", "assets/images/play.png");
    };
});

$("#youtube-logo").on("click", getYouTube);

$("#modal-youtube").on('hidden.bs.modal', function () {
    ytPlayer.stopVideo();
});

songPreview.onended = function () {
    $(".play-button").attr("src", "assets/images/play.png");
};

//Initialize YouTube player
loadYTPlayer();