(function () {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("is-visible", window.scrollY > 360);
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === heroIndex);
    });
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showHero(index);
        restartHero();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        showHero(heroIndex - 1);
        restartHero();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showHero(heroIndex + 1);
        restartHero();
      });
    }
    restartHero();
  }

  document.querySelectorAll("[data-page-filter]").forEach(function (input) {
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      const keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", keyword !== "" && !text.includes(keyword));
      });
    });
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function movieCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-card>" +
      "<a class=\"card-cover\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"card-shade\"></span>" +
      "<span class=\"card-label\">" + escapeHtml(movie.category) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p class=\"card-desc compact\">" + escapeHtml(movie.description) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  const searchInput = document.querySelector("[data-site-search]");
  const searchCategory = document.querySelector("[data-site-category]");
  const searchResults = document.querySelector("[data-search-results]");

  function renderSearch() {
    if (!searchInput || !searchResults || !window.movieSearchData) {
      return;
    }
    const keyword = searchInput.value.trim().toLowerCase();
    const category = searchCategory ? searchCategory.value : "";
    const list = window.movieSearchData.filter(function (movie) {
      const text = [movie.title, movie.description, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase();
      const matchedKeyword = keyword === "" || text.includes(keyword);
      const matchedCategory = category === "" || movie.category === category;
      return matchedKeyword && matchedCategory;
    }).slice(0, 120);
    searchResults.innerHTML = list.map(movieCard).join("");
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", renderSearch);
    if (searchCategory) {
      searchCategory.addEventListener("change", renderSearch);
    }
  }

  function initPlayer(box) {
    const video = box.querySelector("video");
    const playButton = box.querySelector("[data-play-button]");
    const url = box.getAttribute("data-play");
    let loaded = false;
    let hls = null;

    function playVideo() {
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function start() {
      if (!video || !url) {
        return;
      }
      box.classList.add("is-started");
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.addEventListener("loadedmetadata", playVideo, { once: true });
        }
      } else {
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      }
    }

    if (playButton) {
      playButton.addEventListener("click", start);
    }
    box.addEventListener("click", function (event) {
      if (!loaded && event.target !== video) {
        start();
      }
    });
    video.addEventListener("click", function () {
      if (!loaded) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(initPlayer);
})();
