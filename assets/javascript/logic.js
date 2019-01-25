// Initialize Firebase
var config = {
    apiKey: "AIzaSyCO0tZ3Krv3d0CynNFNNrA9_-LRR0W7C-A",
    databaseURL: "https://moviemusicenthusiasts.firebaseio.com",
};

firebase.initializeApp(config);
var dbRef = firebase.database().ref("\links");

var movieLinks = { site: ["The Movie Database", "IMDB", "Rotten Tomatoes", "Fandango", "Screen Rant"], url: ["https://www.themoviedb.org/", "https://www.imdb.com/", "https://www.rottentomatoes.com/", "https://www.fandango.com/"] };
var musicLinks = { site: ["Apple Music", "Spotify", "Pandora", "Soundcloud"], url: ["https://apple.com/itunes", "https://www.spotify.com", "https://www.pandora.com", "https://www.soundcloud.com/", "https://screenrant.com/"] };

dbRef.set({
    movies: JSON.stringify(movieLinks),
    music: JSON.stringify(musicLinks)
});

var term;
var genre;
var queryURL;
var page = 1;
var totalPages;
var songPreview = document.createElement("audio");
var soundtrackSongs = {};
var genres = { "Blues": 2, "Comedy": 3, "Children's Music": 4, "Classical": 5, "Country": 6, "Electronic": 7, "Holiday": 8, "Opera": 9, "Jazz": 11, "Latino": 12, "New Age": 13, "Pop": 14, "R&B/Soul": 15, "Soundtrack": 16, "Dance": 17, "Hip-Hop/Rap": 18, "World": 19, "Alternative": 20, "Rock": 21, "Christian & Gospel": 22, "Vocal": 23, "Raggae": 24, "Easy Listening": 25, "J-Pop": 27, "Anime": 29, "K-Pop": 51, "Instrumental": 53, "Brazillian": 1122, "Disney": 50000063 }

dbRef.on("value", function(snapshot) {
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
        $('#modal-title').text("Movie Search");
        $('#modal-message').text("No movies found based on your search.");
        $('#modal-box').modal('show');
    };

    $(".movie").fadeIn("slow", function() {
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

    $("#movie-search-soundtracks").empty();
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
    }).then(function(response) {
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
            queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=" + albumIDS.toString() + "&entity=song";

            $.ajax({
                url: queryURL,
                method: "GET",
                dataType: "JSON"
            }).then(function(response) {
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
                $("#movie-search-soundtracks").append(soundtrackDiv);
            };
        }
    }

    var soundTrackCount = $("#movie-search-soundtracks").children().length;
    $(".soundtrack-count").text(" - " + soundTrackCount + " soundtrack(s) found");

    $(".movie-soundtrack").fadeIn("slow", function() {
        // animation complete
    });

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
            $("#soundtrack-header").attr("data-id", $(this).attr("data-id"));
            var newTR = $('<tr>');
            newTR.append('<td><img class="play-button" src="assets/images/play.png" data-preview=' + soundtrackSongs[i].previewUrl + '></td>');
            newTR.append('<td>' + soundtrackSongs[i].discNumber + '</td>');
            newTR.append('<td>' + soundtrackSongs[i].trackNumber + '</td>');
            newTR.append('<td>' + soundtrackSongs[i].trackName + '</td>');
            newTR.append('<td><a href=' + soundtrackSongs[i].artistViewUrl + ' target="_blank">' + soundtrackSongs[i].artistName + '</a></td>');
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

    console.log(details);
    anime({
        targets: this,
        rotate: {
            value: '+=2turn', // 0 + 2 = '2turn'
            duration: 500,
            easing: 'easeInOutSine'
        },
        direction: 'reverse'
    });

    getSongSuggestions(details);
};

function getSongSuggestions(details) {
    queryURL = "https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=" + details.artistID.toString() + "&media=music&entity=song&country=us";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function(response) {
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
};

function resetMovieSearch() {
    $("#movie-search-wrapper").hide();
    $("#movie-search-movies").empty();
    $("#movie-search-soundtracks").empty();
    $(".movie-count").text("");
    $(".soundtrack-count").text("");
    $("#soundtrack-header").text("Soundtrack");
    $("#soundtrack-header").attr("data-id", "");
    $("#soundtrack-table").empty();
    $("#suggested-table").empty();
}

function searchTMDB() {
    var queryURL = "https://api.themoviedb.org/3/search/movie?api_key=cb56eb197668ef66bec1c2c9f31d14e0&query=" + term + "&adult=false&page=" + page;

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "JSON"
    }).then(function(response) {
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
    ytPlayer = new YT.Player('youtube-player', {
        height: '390',
        width: '640',
        videoId: 'YzEL7Vga5AM',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    $('#modal-youtube').modal('show');
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
    // if (event.data == YT.PlayerState.PLAYING && !done) {
    //     setTimeout(stopVideo, 6000);
    //     done = true;
    // }
}

function stopVideo() {
    player.stopVideo();
}

$("#search-by").change(function() {
    if ($("#search-by").val() === "Music Genre") {
        $("#genre-group").show();
        $("#search-term").prop("disabled", true);
    } else {
        $("#genre-group").hide();
        $("#search-term").prop("disabled", false);
    };
});

$("#search-button").on("click", function(event) {
    event.preventDefault();
    term = $("#search-term").val().trim();

    if (term === "") { return false };
    $("#welcome").hide();
    term = term.replace(/\W+/g, '+').toLowerCase();

    switch ($("#search-by").val()) {
        case "Movie":
            resetMovieSearch();
            page = 1; // start on page one of possible movie search results
            searchTMDB();
            break;
        case "Music Artist":

    };
});

// Search by Movie - begin the process of finding the soundtrack for the selected movie
$(document).on("click", ".movie", getMovieSoundtrack);

// Display the songs for the selected soundtrack
$(document).on("click", ".movie-soundtrack", displaySoundtrackSongs);

$(document).on("click", ".play-button", function() {
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

songPreview.onended = function() {
    $(".play-button").attr("src", "assets/images/play.png");
};

loadYTPlayer();