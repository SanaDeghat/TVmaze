let apiURL = 'http://api.tvmaze.com/';

// Initialize page after HTML loads
window.onload = function () {
    closeLightBox(); // Close the lightbox initially
    document.getElementById("button").onclick = function () {
        searchTvShows();
    };
    document.getElementById("lightbox").onclick = function (event) {
        if (event.target === document.getElementById("lightbox")) {
            closeLightBox(); // Close lightbox only when clicking outside the content
        }
    };
}; // window.onload

// Get data from TV Maze
async function searchTvShows() {
    document.getElementById("main").innerHTML = "";

    let search = document.getElementById("search").value;

    try {
        const response = await fetch(apiURL + 'search/shows?q=' + search);
        const data = await response.json();
        showSearchResults(data);
    } catch (error) {
        console.error('Error fetching TV shows:', error);
    }
}

// Display search results
function showSearchResults(data) {
    for (let tvshow of data) {
        createTVShow(tvshow);
    }
}

// Create a card for each TV show
function createTVShow(tvshowJSON) {
    if (!tvshowJSON.show) return;

    let elemMain = document.getElementById("main");

    let elemDiv = document.createElement("div");
    elemDiv.classList.add("card");

    let elemShowTitle = document.createElement("h2");
    elemShowTitle.classList.add("showtitle");

    let elemGenre = document.createElement("div");
    let elemRating = document.createElement("div");
    let elemSummary = document.createElement("div");

    //card data
    elemShowTitle.innerHTML = tvshowJSON.show.name;
    elemGenre.innerHTML = "Genres: " + showGenres(tvshowJSON.show.genres);
    elemRating.innerHTML = "Rating: " + (tvshowJSON.show.rating.average || "N/A");
    elemSummary.innerHTML = tvshowJSON.show.summary || "No summary available.";

    elemDiv.appendChild(elemShowTitle);
    elemDiv.appendChild(elemGenre);
    elemDiv.appendChild(elemRating);
    elemDiv.appendChild(elemSummary);

    // Add image only if available (serch rcne for this its so ennoying)
    if (tvshowJSON.show.image) {
        let elemImage = document.createElement("img");
        elemImage.src = tvshowJSON.show.image.medium;
        elemDiv.appendChild(elemImage);
    }

    // Fetch episodes and append them
    let showId = tvshowJSON.show.id;
    fetchEpisodes(showId, elemDiv);

    elemMain.appendChild(elemDiv);
}

// Display genres as a bulleted list
function showGenres(genres) {
    return genres.length ? "<ul>" + genres.map(g => `<li>${g}</li>`).join('') + "</ul>" : "None";
}

// Fetch episodes for a TV show
async function fetchEpisodes(showId, elemDiv) {
    try {
        const response = await fetch(apiURL + 'shows/' + showId + '/episodes');
        const data = await response.json();
        showEpisodes(data, elemDiv);
    } catch (error) {
        console.error('Error fetching episodes:', error);
    }
}

// Display episodes in an ordered list or show "No episodes found."
function showEpisodes(data, elemDiv) {
    let elemEpisodes = document.createElement("div");

    if (data.length === 0) {
        elemEpisodes.innerHTML = "<p>No episodes found.</p>";
    } else {
        let output = "<ol>";
        for (let episode of data) {
            if (!episode.name || !episode.id) continue;
            output += `
                <li>
                    <a href="javascript:showLightBox(${episode.id})">${episode.name}</a>
                </li>`;
        }
        output += "</ol>";
        elemEpisodes.innerHTML = output;
    }

    elemDiv.appendChild(elemEpisodes);
}

// Display lightbox with episode details
async function showLightBox(episodeId) {
    let lightbox = document.getElementById("lightbox");
    lightbox.style.display = "flex";

    try {
        const response = await fetch(apiURL + 'episodes/' + episodeId);
        const episode = await response.json();

        document.getElementById("message").innerHTML = `
            <img src="${episode.image ? episode.image.medium : 'https://via.placeholder.com/210'}" alt="Episode Image">
            <h3>${episode.name}</h3>
            <p><strong>Season:</strong> ${episode.season}, <strong>Episode:</strong> ${episode.number}</p>
            <p>${episode.summary || "No summary available."}</p>
        `;
    } catch (error) {
        console.error('Error fetching episode details:', error);
        document.getElementById("message").innerHTML = "<p>Error loading episode details.</p>";
    }
}

// Close the lightbox
function closeLightBox() {
    document.getElementById("lightbox").style.display = "none";
}

// Load the service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      }, function(error) {
        console.error('Service Worker registration failed:', error);
      });
    });
  }
  
