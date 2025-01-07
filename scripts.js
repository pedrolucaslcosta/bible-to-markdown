/**
 * NOTES
 *
 * ALTERNATIVA PROXY: "https://proxy.corsfix.com/?";
 *
 */
/**
 * -----------------------------------------------------------------------------
 * ENVIRONMENT
 * -----------------------------------------------------------------------------
 */

const BASE_URL = "https://bolls.life/";
const PROXY = "https://api.cors.lol/?url=";
const VERSIONS_JSON = "languages.json";
const BOOKS_JSON = "translations_books.json";

var versions;
var books;

var markdown = "";

async function fetchVersions() {
  try {
    const response = await fetch(VERSIONS_JSON);
    if (!response.ok) throw new Error("Erro ao carregar as versões.");
    versions = await response.json();
    console.log(versions);
  } catch (error) {
    console.error("Erro ao carregar as versões:", error);
  }
}

async function listVersions() {
  const select = $("#select-version");
  select.empty();

  versions.forEach(({ language, translations }) => {
    translations.forEach(({ short_name, full_name }) => {
      if (language === "Portuguese") {
        const option = $("<option>", {
          value: short_name,
          text: `${short_name}, ${full_name}`,
        });
        select.append(option);
      }
    });
  });
}

async function fetchBooks() {
  try {
    const response = await fetch(BOOKS_JSON);
    if (!response.ok) throw new Error("Erro ao carregar os livros.");
    books = await response.json();
    books = books["NVT"];
    console.log("BOOKS", books);
  } catch (error) {
    console.error("Erro ao carregar os livros:", error);
  }
}

function listBooks() {
  const select = $("#select-book");
  select.empty();

  books.forEach(({ bookid, name }) => {
    const option = $("<option>", {
      value: bookid,
      text: name,
    });
    select.append(option);
  });
}

function listChapters() {
  const select = $("#select-chapter");
  select.empty();

  const bookid = $("#select-book").val();

  const chapters = books[bookid - 1].chapters;

  for (let i = 1; i <= chapters; i++) {
    const option = $("<option>", {
      value: i,
      text: i,
    });
    select.append(option);
  }
}

// -----------------------------------------------------------------------------

async function fetchText() {
  const version = $("#select-version").val();
  const book = $("#select-book").val();
  const chapter = $("#select-chapter").val();

  try {
    const output = $("#output");

    const url = `${BASE_URL}get-chapter/${version}/${book}/${chapter}/`;

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

    
    output.empty();

    $.each(data, function (index, value) {
      var verse = value.verse;
      var text = value.text;
      markdown += `${verse}. ${text}\n`;
    });

    output.html(markdown);
  } catch (error) {
    console.error("Erro ao carregar o texto:", error);
    const output = document.getElementById("output");
    output.innerHTML = "<p>Erro ao carregar o texto.</p>" + error;
  }
}

function copyText() {
  console.log("copyText", markdown);
  navigator.clipboard.writeText(markdown);
  alert("Texto copiado!");
}
// -----------------------------------------------------------------------------

(async function init() {
  await fetchVersions();
  await fetchBooks();
  listVersions();
  listBooks();
  listChapters();
})();

$(document).ready(function () {
  $("#select-book").change(function () {
    listChapters();
  });

  $("#load-text").click(function () {
    fetchText();
    $("#copy-button").removeAttr("disabled");
  });

  $("#copy-button").click(function () {
    copyText();
  });
});
