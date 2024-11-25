import data from "./data/posts.json" with { type: "json" };
import categories from "./data/categories.json" with { type: "json" };

const data_event = [...data];
const searchInput = document.querySelector("[data-search]");
const button = document.querySelector("#btn-lucky-post");
const button1 = document.querySelector("#btn-lucky-category");
const searchResult = document.querySelector("#search-result")
const body = document.querySelector('body')


data.forEach((e, i) => {
  const date = data_event[i].interprete_date;
  data_event[i].interprete_date = new Date(date);
});

data_event.sort((a, b) => a.interprete_date - b.interprete_date);

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

    // this.items_obj.forEach((element, index) => {
    // });
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
  date.textContent = event.date;

  const screenFileName = event.screenFileName.replace(/\.jpg$/, ".webp");
  // cover.style.backgroundImage = `url('./assets/img/screenshot/${screenFileName}')`;
  cover.setAttribute('src', `./assets/img/screenshot/${screenFileName}`)

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

    if (highlight) {
      highlightedText(value, title)
      highlightedText(value, provider)
      highlightedText(value, categories)
    }


    if (
      regex.test(event.title) ||
      regex.test(event.category) ||
      regex.test(event.provider)
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



const luckyGenerator = {
  postId: "",
  previousId: [],
  list: [],
  randomId: 0,
  go({ list, key }) {

    handleScrollTop()

    if (list.length) {
      this.list = list;
    }

    const randomId = this.getRandomId(this.list.length)
    const title = this.list[randomId][key]
    if (!this.previousId.includes(title)) {
      this.postId = title
      this.previousId.push(this.postId)
      handleSearch(this.postId, false)


    }
    else {
      if (this.previousId.length === this.list.length) {
        this.previousId = []
      }
      this.go({ list, key })
    }
  },
  getRandomId(max) {
    this.randomId = Math.floor(Math.random() * max);
    return this.randomId
  }

}


button.addEventListener("click", () => luckyGenerator.go({ list: data, key: "title" }))
button1.addEventListener("click", () => luckyGenerator.go({ list: categories, key: "key" }))


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
        // observer.unobserve(target);
      }
    })
    // entries est un tableau contenant des IntersectionObserverEntry
  }, {
    threshold: 0.15 // permet d'indiquer la zone à partir de laquelle l'élément devient 'visible'
  });

  const items = document.querySelectorAll('.card')
  for (const item of items) {
    observer.observe(item)
  }

});

