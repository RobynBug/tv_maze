"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchKeyword) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${searchKeyword}`
  );
  const showArray = Array.from(response.data);
  const ArrayOfShows = [];

  for (let item of showArray) {
    ArrayOfShows.push({
      id: item.show.id,
      name: item.show.name,
      summary: item.show.summary,
      image: item.show.image ? item.show.image.medium : "",
    });
  }
  return ArrayOfShows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let $show;
    if (show.image) {
      $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src= ${show.image}
              alt= ${show.image} ? "${show.name}": "";
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
      );
    } else {
      $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
       <div class="media">
         <div class="media-body">
           <h5 class="text-primary">${show.name}</h5>
           <div><small>${show.summary}</small></div>
           <button class="btn btn-outline-light btn-sm Show-getEpisodes">
             Episodes
           </button>
         </div>
       </div>
     </div>
    `
      );
    }
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );
  const arrayOfEpisodes = Array.from(response.data);
  const episodes = [];

  for (let episode of arrayOfEpisodes) {
    episodes.push({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    });
  }
  console.log(episodes);
  return episodes;
}

/** Write a clear docstring for this function... */
/** Populate the episodes area in the DOM with markup for each episode.
 */

function populateEpisodes(episodes) {
  for (let episode of episodes) {
    const $episode = $(
      `<li id="${episode.id}">${episode.name}</li>
          <ul>
            <li>Season: ${episode.season}</li>
            <li>Episode: ${episode.number}</li>
        </ul>`
    );
    $("#episodesList").append($episode);
  }
}

// Event listener for episodes button click
$showsList.on("click", ".Show-getEpisodes", async function (evt) {
  evt.preventDefault();
  $("#episodesList").empty();
  const showId = $(this).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
  $episodesArea.show();
});

$(document).ready(function () {
  // Event listener for the "Hide Episodes" button
  $(".hideEpisodes").on("click", function (evt) {
    evt.preventDefault();
    $("#episodesArea").hide();
  });
});
