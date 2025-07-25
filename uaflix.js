(function () {
  "use strict";

  // Задаємо URL для пошуку (пошуковий запит замінюється на {query})
  var searchURL =
    "https://uafix.net/search.html?do=search&subaction=search&story={query}";

  // Функція для пошуку фільмів за запитом
  function searchMovies(query) {
    // Формуємо правильний URL для запиту
    var url = searchURL.replace("{query}", encodeURIComponent(query));

    // Використовуємо fetch для запиту до сайту
    fetch(url)
      .then((response) => response.text()) // Отримуємо HTML сторінку
      .then((data) => {
        let movies = [];

        // Використовуємо регулярні вирази для пошуку назв фільмів
        let movieTitles = data.match(/<h2 class="entry-title">(.*?)<\/h2>/g); // шукаємо заголовки фільмів

        if (movieTitles) {
          movieTitles.forEach((title) => {
            let movie = title.replace(/<.*?>/g, ""); // Очищаємо HTML-теги
            movies.push(movie); // Додаємо фільм у масив
          });
        }

        // Виводимо знайдені фільми
        if (movies.length > 0) {
          console.log("Знайдені фільми:");
          movies.forEach((movie) => console.log(movie));

          // Тут можна додати відображення фільмів в інтерфейсі Lampa
          Lampa.Activity.replace({
            search: query,
            clarification: true,
            similar: true,
          });
        } else {
          console.log("Фільми не знайдені");
        }
      })
      .catch((error) => {
        console.error("Помилка при пошуку:", error);
      });
  }

  // Отримуємо запит з пошукової строки Lampa
  Lampa.Listener.follow("search", function (data) {
    var searchQuery = data.search; // Це буде введений користувачем запит
    if (searchQuery) {
      searchMovies(searchQuery); // Викликаємо функцію для пошуку фільмів
    }
  });
})();
