(function() {
  'use strict';

  // Задаємо URL для пошуку (пошуковий запит замінюється на {query})
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
        console.log("Знайдені фільми:");
        if (movies.length > 0) {
          movies.forEach(movie => console.log(movie));  // Логування кожного знайденого фільму
        } else {
          console.log("Фільми не знайдені");
        }

        // Виводимо знайдені фільми через темплейт Lampa
        var movieListHTML = '';
        movies.forEach(movie => {
          // Для кожного фільму використовуємо Lampa Template для відображення
          movieListHTML += Lampa.Template.get('lampac_prestige_folder', {
            title: movie,
            time: "Не вказано",
            info: "Інформація відсутня"
          });
        });

        // Додаємо знайдені фільми в контейнер за допомогою scroll.append()
        scroll.append(movieListHTML);

      })
      .catch(error => {
        console.error('Помилка при пошуку:', error);
      });
  }

  // Отримуємо запит на пошук від Lampa
  Lampa.Listener.follow('search', function(data) {
    var searchQuery = data.search;  // Отримуємо запит, введений користувачем
    if (searchQuery) {
      searchMovies(searchQuery);  // Викликаємо функцію для пошуку фільмів
    }
  });

})();
