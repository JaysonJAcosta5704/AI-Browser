function initializeEventListeners() {
  function loadContent(url) {
    const fullUrl = chrome.runtime.getURL(url);
    console.log("Fetching URL:", fullUrl);  

    fetch(fullUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((data) => {
        document.querySelector(".container").innerHTML = '';
        document.querySelector(".container").innerHTML = data;
        initializeEventListeners();
        loadFavorites();
        displayFavoritesInContainer();
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
      });
  }

  const buttons = {
    "favorites": "html/favorites.html",
    "top": "html/top.html",
    "text": "html/text.html",
    "code": "html/code.html",
    "image": "html/image.html",
    "other": "html/other.html",
    "dash": "html/dashboard.html",
    "welcome": "html/welcome.html",
    "search": "html/search.html",
    "about": "html/aboutme.html",
  };

  for (const [buttonId, url] of Object.entries(buttons)) {
    const button = document.getElementById(buttonId);
    if (button && !button.getAttribute('data-listener-attached')) {
      button.addEventListener("click", function () {
        loadContent(url);
      });
      button.setAttribute('data-listener-attached', 'true');
    }
  }

  document.querySelector('.container').addEventListener('click', function(event) {
    const buttonId = event.target.id;
    const url = buttons[buttonId];
    if (url) {
      loadContent(url);
    }
  });

  const favoriteStars = document.querySelectorAll(".favorite-star");
  for (const star of favoriteStars) {
    star.addEventListener("click", function () {
      const serviceName = star.getAttribute("data-service");
      const serviceURL = star.previousElementSibling.href;

      chrome.storage.sync.get(["favorites"], function (result) {
        let favorites = result.favorites || [];
        const existingFavorite = favorites.find(fav => fav.name === serviceName);

        if (existingFavorite) {
          favorites = favorites.filter(fav => fav.name !== serviceName);
          star.textContent = "☆";
        } else {
          favorites.push({ name: serviceName, url: serviceURL });
          star.textContent = "★";
        }
        chrome.storage.sync.set({ favorites: favorites });
      });
    });
  }
}

function loadFavorites() {
  chrome.storage.sync.get(["favorites"], function (result) {
    const favorites = result.favorites || [];
    for (const fav of favorites) {
      const star = document.querySelector(`.favorite-star[data-service="${fav.name}"]`);
      if (star) {
        star.textContent = "★";
      }
    }
  });
}

function displayFavoritesInContainer() {
  const favoritesContainer = document.getElementById("favorites-container");
  
  if (!favoritesContainer) return;

  chrome.storage.sync.get(["favorites"], function (result) {
    const favorites = result.favorites || [];

    favoritesContainer.innerHTML = "";

    for (const favorite of favorites) {
      const favButton = document.createElement("button");
      favButton.textContent = favorite.name;
      favButton.addEventListener("click", function () {
        window.open(favorite.url, "_blank"); 
      });
      favoritesContainer.appendChild(favButton);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  loadFavorites();
  displayFavoritesInContainer();
});
