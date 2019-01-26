## Music Movie Enthusiasts

Everyone likes music, and most everyone likes movies, so this app was born as a means to bridge the two. There's a lot of apps that give you music recommendations based on the music you like, and others that give you movie suggestions based on your tastes. We also happened to enjoy movie soundtracks, in particular. So this created an interesting question: what if I wanted to get music based on the movies I liked, or vice versa?

 When you think of film, music is half of the entire experience. It sets the tone of a situation, creates or relieve tension, sometimes a story is executed entirely through music. "Musicals". It goes without saying: music soundtracks are important. 

_______________________________________________________________________________________

### We are:

#### Jamie DeLong
#### Evan Moynahan
#### Jesus Salazar
#### Jovan Williams

_______________________________________________________________________________________

##The way it works:

| Search functions | Description |
| ------ ----------| ----------- |
| Movie  | Pulls a list of movies by title, which then shows different soundtracks, with album art and previews of each track. Additionally, gives music recommendations based on those artists that contributed to the soundtrack  |
| Music Artist | Pulls a list of artists that have contributed to a movie soundtrack, along with recommendations to other movies |
| Genre   | Pulls a list of soundtracks that stratify to that particular genre, as well as the movies those soundtracks were featured  |

_______________________________________________________________________________________________________________

+Searching by _Movie_ calls the [Online Movie Database API](www.omdbapi.com) and shows the posters a number of results. When you click on a movie poster of the movie your looking for, an ajax call is made to the [iTunes API](https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/), showing the max number of results. 

+ Searching "Matrix" will pull all movies related to that term. If you were to click on "The Matrix" (starring Keanu Reeves), you would then get the soundtracks of that movie and the tracklists, previews, and a Youtube embed link

  ```Click on the album art, it will show you the tracklist, along with the iTunes preview of the track and an embed link to YouTube. To the right of that, there's a list of suggeseted music based on the genre of the artists that contributed to the soundtrack.```

  ```So if you click on "The Matrix (Original Motion Picture Soundtrack)", which shows its track and also shows recommended musics by and related to the artists that contributed to said soundtrack, so in this case you'd be seeing music by Marilyn Manson and Rob Zombie, and so on.```

+ Search by "Music Artist" calls the iTunes API to show a list of related artist by album cover (iTunes API does not allow you to pull that image from the artist's profile on their webpage). The movies in the box below the the "artist results" are movies featuring music similar to the artist you search for. Below that is the tracklist of those movies and other movie soundtracks featuring those contributing artists.

  ``` If you search for "Run DMC", your results will "Run DMC Greatest Hits" and "Rev Run Distortions". In the movie results below you'll find popular and recent movies with soundtracks that feature Hip-Hop, and suggestions based on the artists that contributed to that soundtrack ```

 + "Music Genre" Search pulls movies that features music of that genre. For example, if you select "Country" in the Genre dropdown box, the movie "Cars" will be among the top results, since it features artists such as Sheryl Crow and Rascal Flatts.

  ```To accomplish the last part, a iTunes call generates the artist results, then that information is past to OMDB to generate the relevant movies. After that, iTunes is called again to generate the tracklists of the soundtracks and the recommendations. ``` 


In the side bar, there's a few links to other popular music streaming services, and movie review and information sites.






