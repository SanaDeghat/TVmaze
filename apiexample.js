const apiURL = 'https://api.tvmaze.com/';

window.onload = function () {
    closeLightBox();
    document.getElementById("button").onclick = searchTvShows;
    document.getElementById("lightbox").onclick = function (event) {
        if (event.target === document.getElementById("lightbox")) {
            closeLightBox();
        }
    };
    checkOnlineStatus();
    window.addEventListener("online", checkOnlineStatus);
    window.addEventListener("offline", checkOnlineStatus);
};

// Search TV shows
async function searchTvShows() {
    const mainElem = document.getElementById("main");
    mainElem.innerHTML = "";
    const searchQuery = document.getElementById("search").value;

    if (!navigator.onLine) {
        showOfflineMessage("You are offline. Connect to search for TV shows.");
        return;
    }

    try {
        const response = await fetch(`${apiURL}search/shows?q=${searchQuery}`);
        if (!response.ok) throw new Error("Failed to fetch TV shows.");
        const data = await response.json();
        data.forEach(tvShow => createTVShow(tvShow));
    } catch (error) {
        console.error("Error fetching TV shows:", error);
        mainElem.innerHTML = `<p class="error">Failed to fetch TV shows. Please try again later.</p>`;
    }
}

// Create a TV show card
function createTVShow(tvshowJSON) {
    const { show } = tvshowJSON;
    if (!show) return;

    const mainElem = document.getElementById("main");

    const cardElem = document.createElement("div");
    cardElem.classList.add("card");

    const titleElem = document.createElement("h2");
    titleElem.classList.add("showtitle");
    titleElem.innerText = show.name;

    const genreElem = document.createElement("div");
    genreElem.innerHTML = `<strong>Genres:</strong> ${showGenres(show.genres)}`;

    const ratingElem = document.createElement("div");
    ratingElem.innerHTML = `<strong>Rating:</strong> ${show.rating.average || "N/A"}`;

    const summaryElem = document.createElement("div");
    summaryElem.innerHTML = show.summary || "No summary available.";

    cardElem.append(titleElem, genreElem, ratingElem, summaryElem);

    if (show.image) {
        const imgElem = document.createElement("img");
        imgElem.src = show.image.medium;
        imgElem.alt = `${show.name} Image`;
        cardElem.appendChild(imgElem);
    }

    fetchEpisodes(show.id, cardElem);

    mainElem.appendChild(cardElem);
}

// Show genres as a comma-separated list
function showGenres(genres) {
    return genres.length ? genres.join(", ") : "None";
}

// Fetch and display episodes
async function fetchEpisodes(showId, cardElem) {
    try {
        const response = await fetch(`${apiURL}shows/${showId}/episodes`);
        if (!response.ok) throw new Error("Failed to fetch episodes.");
        const episodes = await response.json();
        const episodeList = episodes.map(ep => `
            <li>
                <a href="javascript:showLightBox(${ep.id})">${ep.name}</a>
            </li>
        `).join("");
        const episodeElem = document.createElement("div");
        episodeElem.innerHTML = episodes.length ? `<ol>${episodeList}</ol>` : "<p>No episodes available.</p>";
        cardElem.appendChild(episodeElem);
    } catch (error) {
        console.error("Error fetching episodes:", error);
        cardElem.innerHTML += "<p>Failed to fetch episodes.</p>";
    }
}

// Display episode details in lightbox
async function showLightBox(episodeId) {
    const lightbox = document.getElementById("lightbox");
    lightbox.style.display = "flex";

    try {
        const response = await fetch(`${apiURL}episodes/${episodeId}`);
        if (!response.ok) throw new Error("Failed to fetch episode details.");
        const episode = await response.json();
        document.getElementById("message").innerHTML = `
            <img src="${episode.image ? episode.image.medium : 'https://via.placeholder.com/210'}" alt="Episode Image">
            <h3>${episode.name}</h3>
            <p><strong>Season:</strong> ${episode.season}, <strong>Episode:</strong> ${episode.number}</p>
            <p>${episode.summary || "No summary available."}</p>
        `;
    } catch (error) {
        console.error("Error fetching episode details:", error);
        document.getElementById("message").innerHTML = "<p>Error loading episode details.</p>";
    }
}

// Close the lightbox
function closeLightBox() {
    document.getElementById("lightbox").style.display = "none";
}

// Show offline message
function showOfflineMessage(message) {
    const mainElem = document.getElementById("main");
    mainElem.innerHTML = `<p class="offline">${message}</p>`;
}

// Check online status and update UI
function checkOnlineStatus() {
    const statusElem = document.getElementById("status");
    if (navigator.onLine) {
        statusElem.style.display = "none";
    } else {
        statusElem.style.display = "block";
        statusElem.innerText = "You are offline. Some features may not work.";
    }
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(
        registration => console.log("Service Worker registered:", registration.scope),
        error => console.error("Service Worker registration failed:", error)
    );
}
