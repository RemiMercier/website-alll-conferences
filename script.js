import data from "./data/posts.json" with { type: "json" };
import categories from "./data/categories.json" with { type: "json" };

const data_event = [...data];
const searchInput = document.querySelector("[data-search]");

data.forEach((e, i) => {
  const date = data_event[i].interprete_date;
  data_event[i].interprete_date = new Date(date);
});

data_event.sort((a, b) => a.interprete_date - b.interprete_date);


// Categories initialization

const keys = [];

categories.forEach(element => {
  keys.push(element.key);
});


const categoriesPreview = {
  items: {},
  displayMax: 15,
  init(keys) {
    keys.forEach((el) => {
      this.add(el.key);
    });
  },
  update() {
    const previewSearch = document.querySelector("[data-search] p");
    previewSearch.textContent = Object.keys(this.items)
      .slice(0, this.displayMax)
      .join(" - ");
  },
  add(key) {
    this.items[key] = key;
    this.update();
  },
  remove(key) {
    if (this.items[key] !== undefined) {
      delete this.items[key];
      this.update();
    }
  },
};

categoriesPreview.init(categories);

let events = [];

const eventCardTemplate = document.querySelector("[data-event-template]");
const eventCardContainer = document.querySelector(
  "[data-event-cards-container]"
);

events = data_event.map((event) => {
  const card = eventCardTemplate.content.cloneNode(true).children[0];
  const summary = card.querySelector("[data-summary]");
  const cover = card.querySelector("[data-cover] .image");
  const title = card.querySelector("[data-title]");
  const link = card.querySelector("[data-link]");
  const provider = card.querySelector("[data-provider] p");
  const categories = card.querySelector("[data-categories]");
  const date = card.querySelector("[data-date]");

  title.textContent = event.title;
  link.setAttribute("href", event.link);

  summary.textContent = event.summary;
  provider.textContent = event.provider;
  categories.textContent = event.category;
  date.textContent = event.date;

  const screenFileName = event.screenFileName.replace(/\.jpg$/, ".webp");
  cover.style.backgroundImage = `url('./assets/img/screenshot/${screenFileName}')`;

  eventCardContainer.append(card);
  return {
    title: event.title,
    summary: event.summary,
    category: event.category,
    provider: event.provider,
    date: event.date,
    element: card,
    element_original: card,
  };
});

const keyCategories = [];

for (const key in categories) {
  if (Object.prototype.hasOwnProperty.call(categories, key)) {
    keyCategories.push(key);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const highlightedText = (value, paragraph) => {
  let text = paragraph.textContent.toLowerCase();

  if (value.length > 0) {

    // Escape any special characters in the `value` string for regex.
    let escapedValue = escapeRegex(value)

    // Define regex to exclude special characters like @, #, $, etc.
    let regex = new RegExp(`(?![@#$%^&*])${escapedValue}`, "gi");

    let newText = text.replace(
      regex,
      `<span class="highlight-word">${value}</span>`
    );


    if (text !== newText) {
      paragraph.innerHTML = newText;
    } else {
      paragraph.innerHTML = text;
    }
  } else {
    paragraph.innerHTML = text;
  }
};


function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

searchInput.addEventListener("input", (e) => {
  let value = e.target.value.toLowerCase();

  const escapedValue = escapeRegex(value);
  const regex = new RegExp(`\\b${escapedValue}`, 'i');

  keys.forEach((key) => {


    if (regex.test(key)) {
      categoriesPreview.add(key);
    } else {
      categoriesPreview.remove(key);
    }
  });

  events.forEach((event) => {
    const title = event.element.querySelector("[data-title]");
    const paragraph = event.element.querySelector("[data-summary]");
    const provider = event.element.querySelector("[data-provider] p");
    const categories = event.element.querySelector("[data-categories]");


    highlightedText(value, title)
    // highlightedText(value, paragraph)
    highlightedText(value, provider)
    highlightedText(value, categories)

    if (
      regex.test(event.title) ||
      regex.test(event.category) ||
      regex.test(event.provider)
    ) {
      event.element.classList.remove("hide");
      event.element.classList.add("hightlight");
    } else {
      event.element.classList.add("hide");
      event.element.classList.remove("hightlight");
    }

    if (value === "") {
      event.element.classList.remove("hightlight");
    }
  });
});
