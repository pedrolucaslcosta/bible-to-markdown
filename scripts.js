/**
 * -----------------------------------------------------------------------------
 * ENVIRONMENT
 * -----------------------------------------------------------------------------
 */

const BASE_URL = "https://bolls.life/";

// const PROXY = "https://proxy.corsfix.com/?";
const PROXY = "https://api.cors.lol/?url=";
// const PROXY = "";

const LANGUAGES_JSON = "languages.json";

const TRANSLATION_BOOKS_JSON = "translations_books.json";

/**
 * -----------------------------------------------------------------------------
 * FUNCTIONS
 * -----------------------------------------------------------------------------
 */

async function loadBibleVersions() {
  try {
    const response = await fetch(LANGUAGES_JSON);

    if (!response.ok) throw new Error("Erro ao carregar os dados.");

    const data = await response.json();
    console.log("LANGUAGES_JSON", data);

    const select = document.getElementById("bible-versions");

    select.innerHTML = "";

    data.forEach(({ language, translations }) => {
      translations.forEach(({ short_name, full_name }) => {
        if (language === "Portuguese") {
          const option = document.createElement("option");
          option.value = short_name;
          option.textContent = `${short_name}, ${full_name}`;
          select.appendChild(option);
        }
      });
    });
  } catch (error) {
    console.error("Erro ao carregar as versões:", error);
    const select = document.getElementById("bible-versions");
    select.innerHTML = "<option value=''>Erro ao carregar as opções</option>";
  }
}

async function loadBibleBooks(version) {
  try {
    const response = await fetch(TRANSLATION_BOOKS_JSON);

    if (!response.ok) throw new Error("Erro ao carregar os dados.");

    const data = await response.json();
    console.log("TRANSLATION_BOOKS_JSON", data);

    const select = document.getElementById("bible-books");

    select.innerHTML = "";

    const books = data[version];
    console.log("BIBLE_VERSION", version);

    if (!books) throw new Error("Livros não encontrados.");

    console.log("BOOKS", books);

    books.forEach((book) => {
      const optionBook = document.createElement("option");
      optionBook.value = book.bookid;
      optionBook.textContent = book.name;
      select.appendChild(optionBook);

      const chapters = book.chapters; //number

      // get id book-chapters and set options foreach number

      const bookChaptersSelect = document.getElementById("book-chapters");
      bookChaptersSelect.innerHTML = "";

      for (let chapter = 1; chapter <= chapters; chapter++) {
        const option = document.createElement("option");
        option.value = chapter;
        option.textContent = chapter;
        bookChaptersSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Erro ao carregar os livros:", error);
    const select = document.getElementById("bible-books");
    select.innerHTML = "<option value=''>Erro ao carregar os livros</option>";
  }
}

async function fetchText(version, book, chapter) {
  try {
    const output = document.getElementById("output");

    const url = `${BASE_URL}get-text/${version}/${book}/${chapter}`;
    // output.innerHTML = url;

    const response = await fetch(PROXY + url, {
      headers: {
        "x-corsfix-headers": JSON.stringify({
          Origin: "https://www.google.com",
          Referer: "https://www.google.com",
        }),
      },
    });

    console.log(response);

    if (!response.ok) throw new Error("Erro ao carregar os dados.");

    const data = await response.json();
    console.log("DATA", data);

    var markdown = "";
    output.innerHTML = "";

    $.each(data, function (index, value) {
      var verse = value.verse;
      var text = value.text;
      markdown += `${verse}. ${text}\n`;
    });

    output.innerHTML += markdown;
  } catch (error) {
    console.error("Erro ao carregar o texto:", error);
    const output = document.getElementById("output");
    output.innerHTML = "<p>Erro ao carregar o texto.</p>" + error;
  }
}

/**
 * -----------------------------------------------------------------------------
 * EXECUTION
 * -----------------------------------------------------------------------------
 */

loadBibleVersions();

$(document).ready(function () {
  const versionSelect = $("#bible-versions");
  const bookSelect = $("#bible-books");

  versionSelect.on("change", function () {
    const version = versionSelect.val();
    console.log("BIBLE_VERSION", version);
    loadBibleBooks(version);
  });

  const submitButton = $("#load-text");
  submitButton.on("click", function () {
    const version = versionSelect.val();
    const book = bookSelect.val();
    const chapter = bookSelect.val();

    fetchText(version, book, chapter);
  });
});
