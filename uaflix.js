(function() {
  'use strict';

  function UAFixOnlineComponent(object) {
    var query = object.movie.title || object.movie.original_title;
    var searchURL = "https://uafix.net/search.html?do=search&subaction=search&story=" + encodeURIComponent(query);

    var body = $('<div class="online-prestige online-prestige--full selector"></div>');
    var loading = $('<div style="padding:2em;text-align:center">Завантаження...</div>');
    body.append(loading);

    fetch(searchURL)
      .then(response => response.text())
      .then(data => {
        loading.remove();

        var re = /<a\s+class="sres-wrap clearfix"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>[\s\S]*?<h2>([\s\S]*?)<\/h2>[\s\S]*?<div class="sres-desc">([\s\S]*?)<\/div>/g;
        var match, movies = [];
        while ((match = re.exec(data)) !== null) {
          movies.push({
            url: match[1].startsWith('http') ? match[1] : "https://uafix.net" + match[1],
            img: match[2].startsWith('http') ? match[2] : "https://uafix.net" + match[2],
            alt: match[3],
            title: match[4].trim(),
            desc: match[5].trim()
          });
        }

        if (!movies.length) {
          body.append('<div style="padding:2em;text-align:center">Фільми не знайдені</div>');
          return;
        }

        movies.forEach(function(movie) {
          var item = $('<div class="online-prestige online-prestige--folder selector" style="margin-bottom:1em;cursor:pointer"></div>');
          var info = `
            <div style="display:flex;gap:1.3em;align-items:flex-start;">
              <img src="${movie.img}" alt="${movie.alt}" style="width:6em;height:8em;object-fit:cover;border-radius:0.3em;box-shadow:0 2px 8px #0004" />
              <div>
                <div class="online-prestige__title" style="font-size:1.2em;font-weight:600">${movie.title}</div>
                <div class="online-prestige__info" style="margin-top:.5em;color:#bbb">${movie.desc}</div>
                <div style="margin-top:.9em;">
                  <span style="background:#2196f3;color:#fff;padding:.3em .8em;border-radius:.3em;font-size:1em">Відкрити на UAFix</span>
                </div>
              </div>
            </div>
          `;
          item.append(info);
          item.on('hover:enter', function() {
            Lampa.Utils.openLink(movie.url);
          });
          body.append(item);
        });
      })
      .catch(() => {
        loading.text('Помилка при пошуку.');
      });

    return body;
  }

  Lampa.Component.add('uafix', UAFixOnlineComponent);

  Lampa.Listener.follow('full', function(e) {
    if (e.type === 'complite') {
      var btnRow = e.object.activity.render().find('.full-start__buttons');
      if (!btnRow.length) return;
      if (btnRow.find('.uafix--button').length) return;
      var btn = $('<div class="full-start__button selector uafix--button"><span>UAFix Онлайн</span></div>');
      btn.on('hover:enter', function() {
        Lampa.Activity.push({
          url: '',
          title: 'UAFix Онлайн',
          component: 'uafix',
          movie: e.data.movie,
          page: 1
        });
      });
      btnRow.append(btn);
    }
  });

})();
