(function() {
  'use strict';

  // URL для пошуку фільмів (пошуковий запит замінюється на {query})
  var searchURL = "https://uafix.net/search.html?do=search&subaction=search&story={query}";

  // Функція для пошуку фільмів за запитом
  function searchMovies(query) {
    var url = searchURL.replace("{query}", encodeURIComponent(query));

    // Використовуємо fetch для запиту до сайту
    fetch(url)
      .then(response => response.text())  // Отримуємо HTML сторінку
      .then(data => {
        let movies = [];
        
        // Використовуємо регулярні вирази для пошуку назв фільмів
        let movieTitles = data.match(/<h2 class="entry-title">(.*?)<\/h2>/g); // шукаємо заголовки фільмів
        
        if (movieTitles) {
          movieTitles.forEach(title => {
            let movie = title.replace(/<.*?>/g, ''); // Очищаємо HTML-теги
            movies.push(movie); // Додаємо фільм у масив
          });
        }

        // Виводимо знайдені фільми в консоль
        console.log("Знайдені фільми для запиту: " + query);
        if (movies.length > 0) {
          movies.forEach(movie => console.log(movie));  // Логування кожного знайденого фільму
        } else {
          console.log("Фільми не знайдені");
        }

        // Виводимо знайдені фільми через темплейт Lampa
        var movieListHTML = '';
        movies.forEach(movie => {
          movieListHTML += Lampa.Template.get('lampac_prestige_folder', {
            title: movie,
            time: "Не вказано",
            info: "Інформація відсутня"
          });
        });

        // Додаємо знайдені фільми в контейнер
        scroll.append(movieListHTML);

      })
      .catch(error => {
        console.error('Помилка при пошуку:', error);
      });
  }

  // Додаємо джерело до Lampa для пошуку
  function addSourceSearch(spiderName, spiderUri) {
    var network = new Lampa.Reguest();

    var source = {
      title: spiderName,  // Назва джерела
      search: function(params, oncomplite) {
        function searchComplite(links) {
          var keys = Lampa.Arrays.getKeys(links);

          if (keys.length) {
            var status = new Lampa.Status(keys.length);

            status.onComplite = function(result) {
              var rows = [];
              keys.forEach(function(name) {
                var line = result[name];
                if (line && line.data && line.type == 'similar') {
                  var cards = line.data.map(function(item) {
                    item.title = Lampa.Utils.capitalizeFirstLetter(item.title);
                    item.release_date = item.year || '0000';
                    item.balanser = spiderUri;
                    return item;
                  })
                  rows.push({
                    title: name,
                    results: cards
                  })
                }
              })
              oncomplite(rows);  // Передаємо результат пошуку
            }

            keys.forEach(function(name) {
              network.silent(account(links[name]), function(data) {
                status.append(name, data);
              }, function() {
                status.error();
              })
            })
          } else {
            oncomplite([]);
          }
        }

        network.silent(account(Defined.localhost + 'lite/' + spiderUri + '?title=' + params.query), function(json) {
          searchComplite(json);
        }, function() {
          oncomplite([]);
        });
      },
      onCancel: function() {
        network.clear()
      },
      params: {
        lazy: true,
        align_left: true
      },
      onSelect: function(params, close) {
        close();
        Lampa.Activity.push({
          url: params.element.url,
          title: 'Lampac - ' + params.element.title,
          component: 'bwarch',
          movie: params.element,
          page: 1,
          search: params.element.title,
          clarification: true,
          balanser: params.element.balanser,
          noinfo: true
        });
      }
    };
    Lampa.Search.addSource(source);  // Додаємо джерело пошуку до Lampa
  }

  // Додаємо джерело пошуку "Онлайн" для Lampa
  addSourceSearch('Онлайн', 'uafix.net');  // Назва джерела і шлях до нього (замість 'uafix.net' можна використовувати інші URL, якщо потрібно)

  // Отримуємо пошуковий запит з Lampa
  Lampa.Listener.follow('search', function(data) {
    var searchQuery = data.search;  // Отримуємо запит, введений користувачем
    if (searchQuery) {
      searchMovies(searchQuery);  // Викликаємо функцію для пошуку фільмів
    }
  });

})();
