document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("is-visible", window.scrollY > 360);
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    var showSlide = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 6000);
    }
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
    var queryKey = scope.getAttribute("data-query-from-url");

    if (input && queryKey) {
      var params = new URLSearchParams(window.location.search);
      var value = params.get(queryKey);
      if (value) {
        input.value = value;
      }
    }

    var normalize = function (value) {
      return String(value || "").trim().toLowerCase();
    };

    var runFilter = function () {
      var keyword = input ? normalize(input.value) : "";
      var activeFilters = selects.map(function (select) {
        return {
          field: select.getAttribute("data-filter-select"),
          value: normalize(select.value)
        };
      });

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedSelects = activeFilters.every(function (filter) {
          if (!filter.value) {
            return true;
          }
          var cardValue = normalize(card.getAttribute("data-" + filter.field));
          return cardValue === filter.value;
        });
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedSelects));
      });
    };

    if (input) {
      input.addEventListener("input", runFilter);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", runFilter);
    });
    runFilter();
  });
});
