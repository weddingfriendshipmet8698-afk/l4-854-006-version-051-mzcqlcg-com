(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.nav-links');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var input = document.getElementById('movieSearchInput');
    var yearFilter = document.getElementById('yearFilter');
    var regionFilter = document.getElementById('regionFilter');
    var typeFilter = document.getElementById('typeFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
    var empty = document.querySelector('.empty-state');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(input ? input.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');
        var region = normalize(regionFilter ? regionFilter.value : '');
        var type = normalize(typeFilter ? typeFilter.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type')
            ].join(' '));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (region && cardRegion.indexOf(region) === -1) {
                matched = false;
            }
            if (type && cardType.indexOf(type) === -1) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    [input, yearFilter, regionFilter, typeFilter].forEach(function (item) {
        if (item) {
            item.addEventListener('input', runFilter);
            item.addEventListener('change', runFilter);
        }
    });

    var backTop = document.querySelector('.back-top');
    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
