import data from "../data/posts.json" with { type: "json" };
import categories from "../data/categories.json" with { type: "json" };
import { handleScrollTop } from "./utils.js"

let data_event = [...data];
const searchInput = document.querySelector("[data-search]");
const button = document.querySelector("#btn-lucky-post");
const button1 = document.querySelector("#btn-lucky-category");
const button2 = document.querySelector("#btn-lucky-today");

const searchResult = document.querySelector("#search-result")

data.forEach((e, i) => {
  const { date_start, date_end } = data_event[i];
  data_event[i].date = [];

  if (date_start !== "undefined") {
    data_event[i].date.push(date_start)
  }

  if (date_end !== "undefined") {
    data_event[i].date.push(date_end)
  }
});


data_event = data_event.sort((a, b) => {
  const date_start = new Date(a.date[0]).getTime();
  const date_end = new Date(b.date[0]).getTime();
  return date_start - date_end
});

const categories_list = [];
const categories_obj = {};


categories.forEach(element => {
  categories_list.push(element.key);
  categories_obj[element.key] = element
});


const categoriesPreview = {
  items: [],
  items_obj: [],
  categories_list,
  displayMax: 15,
  init() {
    this.items = [...this.categories_list]
    this.items.forEach(key => {
      this.items_obj.push(`${categories_obj[key].key} (${categories_obj[key].length})`)
    });
    this.update()
  },
  update() {
    const previewSearch = document.querySelector("#preview-search");
    previewSearch.innerHTML = ""

    for (const key in this.items_obj) {
      if (key > 12) {
        break
      }


      const category = this.items_obj[key]

      const span = document.createElement("span");
      span.innerText = category

      span.addEventListener("click", (event) => {
        event.preventDefault()
        handleSearch(this.items[key], false)
      })
      previewSearch.appendChild(span);
    }
  },
  add(key) {
    if (!this.items.includes(key)) {

      this.items.push(key)
      this.items_obj.push(`${categories_obj[key].key} (${categories_obj[key].length})`)

      this.update();
    }

  },
  remove(key) {
    if (this.items.includes(key)) {
      const index = this.items.indexOf(key)

      this.items.splice(index, 1)
      this.items_obj.splice(index, 1)

      this.update();
    }
  },
  reset() {
    this.items = []
    this.items_obj = []
    categoriesPreview.init(categories_list);
  }
};

categoriesPreview.init();

let events = [];

const eventCardTemplate = document.querySelector("[data-event-template]");
const eventCardContainer = document.querySelector(
  "[data-event-cards-container]"
);

const padStart = (str) => {
  return String(str).padStart(2, "0");
}

const formatDate = (date) => {
  const day = padStart(date.getDate())
  const month = padStart(date.getMonth() + 1)
  const year = padStart(date.getFullYear())
  const hours = padStart(date.getHours())
  const minutes = padStart(date.getMinutes())

  let currentDate = `${day}/${month}/${year} ${hours}H${minutes}`;
  console.log(currentDate);
  return currentDate
}

events = data_event.map((event) => {
  const card = eventCardTemplate.content.cloneNode(true).children[0];
  const summary = card.querySelector("[data-summary]");
  const cover = card.querySelector("[data-cover] img");
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

  const date_start = new Date(event.date_start)
  const date_start_format = formatDate(date_start)

  const date_end = new Date(event.date_end)
  const date_end_format = formatDate(date_end)

  date.textContent = `${date_start_format} ${event.date_end !== undefined ? '-> ' : ''}${event.date_end !== undefined ? date_end_format : ''}`;

  const screenFileName = event.screenFileName.replace(/\.jpg$/, ".webp");

  cover.setAttribute('src', `./assets/img/screenshot/${screenFileName}`)
  eventCardContainer.append(card);
  return {
    title: event.title,
    summary: event.summary,
    category: event.category,
    provider: event.provider,
    date: `${event.date_start}`,
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

const getNbrOfSearchingResult = (select) => {
  searchResult.innerText = `${select} / ${data_event.length}`
}

getNbrOfSearchingResult(data_event.length)


const diacriticsMap = {
  a: "[aáàâäãåÁÀÂÄÃÅ]",
  e: "[eéèêëÉÈÊË]",
  i: "[iíìîïÍÌÎÏ]",
  o: "[oóòôöõÓÒÔÖÕ]",
  u: "[uúùûüÚÙÛÜ]",
  c: "[cçÇ]",
  n: "[nñÑ]",
};

function escapeRegexCharacters(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function accentInsensitiveRegex(value) {
  const escapedValue = escapeRegexCharacters(value);
  return escapedValue
    .split("")
    .map(char => diacriticsMap[char.toLowerCase()] || char)
    .join("");
}

const highlightedText = (value, paragraph) => {
  if (value.length > 0) {
    let regexPattern = accentInsensitiveRegex(value);
    let regex = new RegExp(`(${regexPattern})`, "gi");

    let text = paragraph.textContent || paragraph.innerText;
    let newText = text.replace(regex, `<span class="highlight-word">$1</span>`);

    paragraph.innerHTML = newText;
  } else {
    paragraph.innerHTML = paragraph.textContent || paragraph.innerText;
  }
};

searchInput.addEventListener("input", (e) => {
  handleSearch(e.target.value);
});

const handleSearch = (e, highlight = true) => {
  searchInput.value = e
  let value = e.toLowerCase();
  const escapedValue = accentInsensitiveRegex(value);
  const regex = new RegExp(`${escapedValue}`, "i");
  let selectedPost = 0

  categories_list.forEach((item) => {
    if (regex.test(item)) {
      categoriesPreview.add(item);
    } else {
      categoriesPreview.remove(item);
    }
  });

  if (value === "") {
    categoriesPreview.reset()
  }


  events.forEach((event) => {
    const title = event.element.querySelector("[data-title]");
    const paragraph = event.element.querySelector("[data-summary]");
    const provider = event.element.querySelector("[data-provider] p");
    const categories = event.element.querySelector("[data-categories]");
    const date = event.element.querySelector("[data-date]");


    if (highlight) {
      highlightedText(value, title)
      highlightedText(value, provider)
      highlightedText(value, categories)
      highlightedText(value, date)
    }


    if (
      regex.test(event.title) ||
      regex.test(event.category) ||
      regex.test(event.provider) ||
      regex.test(event.date)
    ) {
      selectedPost++
      getNbrOfSearchingResult(selectedPost)

      event.element.classList.remove("hide");
      event.element.classList.add("highlight");
    } else {
      event.element.classList.add("hide");
      event.element.classList.remove("highlight");
    }

    if (value === "") {
      event.element.classList.remove("highlight");
    }
  });
};



class LuckyGenerator {
  constructor({ list, key, isScrollTop }) {
    this.postId = "";
    this.previousId = [];
    this.list = list;
    this.randomId = 0;
    this.key = key
    this.isScrollTop = isScrollTop
  }

  go() {
    if (this.isScrollTop) {
      handleScrollTop();
    }

    const randomId = this.getRandomId(this.list.length);
    const title = this.list[randomId][this.key];

    if (!this.previousId.includes(title)) {
      this.postId = title;
      this.previousId.push(this.postId);
      handleSearch(this.postId, false);
    } else {
      if (this.previousId.length === this.list.length) {
        this.previousId = [];
      }
      this.go();
    }
  }

  getRandomId(max) {
    this.randomId = Math.floor(Math.random() * max);
    return this.randomId;
  }
}


const generatorLuckyPost = new LuckyGenerator({
  list: data_event,
  isScrollTop: true,
  key: "title"
});
const generatorLuckyCat = new LuckyGenerator({ list: categories, key: "key" });

const targetDate = new Date().getTime()
const selectedDate = data_event.filter(item => new Date(item.date_start).getTime() > targetDate && new Date(item.date_start).getTime() < targetDate + 60 * 60 * 24 * 0.5 * 1000);

const generatorLuckyToday = new LuckyGenerator({ list: selectedDate, key: "title", isScrollTop: true });


button.addEventListener("click", () => generatorLuckyPost.go())
button1.addEventListener("click", () => generatorLuckyCat.go())



button2.addEventListener("click", el => {
  el.preventDefault();
  generatorLuckyToday.go()
})

addEventListener("DOMContentLoaded", (event) => {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((el) => {
      const target = el.target
      if (el.isIntersecting) {
        target.classList.add("in-view")
        target.classList.remove("not-in-view")
      } else {
        target.classList.remove("in-view")
        target.classList.add("not-in-view")
      }
    })
  }, {
    threshold: 0.15
  });

  const items = document.querySelectorAll('.card')
  for (const item of items) {
    observer.observe(item)
  }

});

