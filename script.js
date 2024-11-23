import data from "./data/posts.json" with { type: "json" };
import categories from "./data/categories.json" with { type: "json" };

const data_event = [...data];
const searchInput = document.querySelector("[data-search]");
const button = document.querySelector("#btn-lucky-post");
const button1 = document.querySelector("#btn-lucky-category");
const body = document.querySelector('body')


data.forEach((e, i) => {
  const date = data_event[i].interprete_date;
  data_event[i].interprete_date = new Date(date);
});

data_event.sort((a, b) => a.interprete_date - b.interprete_date);

const categories_list = [];
const categories_obj = {};


console.log(categories)
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
    const previewSearch = document.querySelector("[data-search] p");

    const html = []

    previewSearch.textContent = this.items_obj
      .slice(0, this.displayMax)
      .join(" - ");
  },
  add(key) {
    // console.log(key)
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

const diacriticsMap = {
  a: "[aáàâäãå]",
  e: "[eéèêë]",
  i: "[iíìîï]",
  o: "[oóòôöõ]",
  u: "[uúùûü]",
  c: "[cç]",
  n: "[nñ]"
};

// Function to replace base characters with regex patterns
function accentInsensitiveRegex(value) {
  return value
    .split("")
    .map(char => diacriticsMap[char] || char)
    .join("");
}



const highlightedText = (value, paragraph) => {
  if (value.length > 0) {
    // Generate regex pattern for accent-insensitive matching
    let regexPattern = accentInsensitiveRegex(value);
    let regex = new RegExp(`(${regexPattern})`, "gi");

    // Highlight matching text
    let text = paragraph.textContent;
    let newText = text.replace(regex, `<span class="highlight-word">$1</span>`);

    paragraph.innerHTML = newText;
  } else {
    paragraph.innerHTML = paragraph.textContent;
  }
};


function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

searchInput.addEventListener("input", (e) => {
  handleSearch(e.target.value)
});


const handleScrollTop = () => {
  if (window.scrollY
    > window.innerHeight / 5) {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
}

const handleSearch = (e) => {

  handleScrollTop()

  let value = e.toLowerCase();

  const escapedValue = accentInsensitiveRegex(value);
  const regex = new RegExp(`${escapedValue}`, 'i');

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


    highlightedText(value, title)
    // highlightedText(value, paragraph)
    highlightedText(value, provider)
    highlightedText(value, categories)

    if (
      regex.test(event.title) ||
      regex.test(event.category)
      ||regex.test(event.provider)
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
}



const luckyGenerator = {
  postId: "",
  previousId: [],
  list: [],
  randomId: 0,
  go({ list, key }) {

    if (list.length) {
      this.list = list;
    }

    const randomId = this.getRandomId(this.list.length)
    console.log(randomId, this.list.length)
    console.log(this.list[randomId])
    const title = this.list[randomId][key]
    if (!this.previousId.includes(title)) {
      this.postId = title
      this.previousId.push(this.postId)
      searchInput.value = this.postId
      handleSearch(this.postId)

    }
    else {
      if (this.previousId.length === this.list.length) {
        this.previousId = []
      }
      this.go({ list, key })

      console.log("retry!", this.previousId.length)
    }
  },
  getRandomId(max) {
    this.randomId = Math.floor(Math.random() * max);
    return this.randomId
  }

}


button.addEventListener("click", () => luckyGenerator.go({ list: data, key: "title" }))

button1.addEventListener("click", () => luckyGenerator.go({ list: categories, key: "key" }))
