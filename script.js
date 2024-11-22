import data from "../response/ollamaResponse.json" with { type: "json" };
import categoriesMin from "../categories/categories-min.json" with { type: "json" };

const data_event = [...data];

data.forEach((e, i) => {
  const date = data_event[i].interprete_date;
  data_event[i].interprete_date = new Date(date);
});

data_event.sort((a, b) => a.interprete_date - b.interprete_date);

// console.log(data_event)
const searchInput = document.querySelector("[data-search]");

const keys = [];
for (const key in categoriesMin) {
  if (Object.prototype.hasOwnProperty.call(categoriesMin, key)) {
    keys.push(key);
  }
}

const categoriesPreview = {
  items: {},
  displayMax: 15,
  init(key) {
    keys.forEach((el) => {
      this.add(el);
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

categoriesPreview.init(keys);

let events = [];

const eventCardTemplate = document.querySelector("[data-event-template]");
const eventCardContainer = document.querySelector(
  "[data-event-cards-container]"
);

events = data_event.map((event) => {
  const card = eventCardTemplate.content.cloneNode(true).children[0];
  const header = card.querySelector("[data-header]");
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
for (const key in categoriesMin) {
  if (Object.prototype.hasOwnProperty.call(categoriesMin, key)) {
    keyCategories.push(key);
  }
}

const highlightedText = (value, paragraph) => {
  let text = paragraph.textContent.toLowerCase();

  if (value.length > 0) {
    let regex = new RegExp(value, "g");
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

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  keys.forEach((key) => {
    if (key.toLowerCase().includes(value)) {
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
    highlightedText(value, paragraph)
    highlightedText(value, provider)
    highlightedText(value, categories)

    if (
      event.title.toLowerCase().includes(value) ||
      event.category.toLowerCase().includes(value) ||
      event.provider.toLowerCase().includes(value)
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
