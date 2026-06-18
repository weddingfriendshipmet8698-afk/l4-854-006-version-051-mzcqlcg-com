(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 320) {
          backTop.classList.add("show");
        } else {
          backTop.classList.remove("show");
        }
      });
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        setSlide(idx);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(current + 1);
      }, 5600);
    }

    var input = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var empty = document.querySelector("[data-empty]");

    function filterCards() {
      if (!cards.length) {
        return;
      }
      var term = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var matched = (!term || haystack.indexOf(term) !== -1) && (!year || cardYear === year) && (!region || cardRegion === region);
        card.style.display = matched ? "" : "none";
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }

    [input, yearSelect, regionSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", filterCards);
        node.addEventListener("change", filterCards);
      }
    });
  });
})();
