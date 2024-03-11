"use strict";

const countriesContainer = document.querySelector(".countries");
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const cancelBtn = document.querySelector(".cancel-btn");

const formatPopulation = function (population) {
  if (population !== undefined && population !== null) {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M People`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(1)}K People`;
    } else {
      return population;
    }
  } else {
    return "";
  }
};

const extractCurrencies = function (currencies) {
  return currencies ? Object.keys(currencies).join(", ") : "";
};

const extractLanguages = function (languages) {
  if (!languages) return "";

  const languageKeys = Object.keys(languages);
  if (languageKeys.length <= 2) {
    return Object.values(languages).join(", ");
  } else {
    const firstTwoLanguages = languageKeys
      .slice(0, 2)
      .map((key) => languages[key]);
    return firstTwoLanguages.join(", ");
  }
};

const renderCountry = function (data, className = "") {
  const populationText = formatPopulation(data.population);
  const languages = extractLanguages(data.languages);
  const currencies = extractCurrencies(data.currencies);

  const html = `
    <article class="country ${className}">
      <img class="country__img" src="${data.flags.png}" />
      <div class="country__data">
        <h3 class="country__name">${data.name.common}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👫</span>${populationText}</p>
        <p class="country__row"><span>🗣️</span>${
          languages || "Not available"
        }</p>
        <p class="country__row"><span>💰</span>${
          currencies || "Not available"
        }</p>
      </div>
    </article>
  `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = 1;
};

const fetchAndRenderCountries = async (url) => {
  const response = await fetch(url);
  if (!response.ok) return [];
  return await response.json();
};

const searchCountry = async (searchValue) => {
  if (!searchValue) return;

  const url = `https://restcountries.com/v3.1/name/${searchValue}`;
  const data = await fetchAndRenderCountries(url);

  cancelBtn.classList.remove("hidden");

  if (data.length === 0) {
    countriesContainer.innerHTML = `<h2>No country found with the name "${searchValue}"</h2>`;
    return;
  }

  countriesContainer.innerHTML = "";
  data.forEach((country) => {
    renderCountry(country);
  });

  const neighbour = data[0];
  if (!neighbour.borders) return;

  const neighbourResponses = await Promise.all(
    neighbour.borders.map((border) =>
      fetchAndRenderCountries(`https://restcountries.com/v3.1/alpha/${border}`)
    )
  );
  const neighbours = neighbourResponses.flatMap((response) => response);

  neighbours.forEach((country) => {
    renderCountry(country, "neighbour");
  });
};

searchBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  const searchValue = searchInput.value;
  if (!searchValue) return;
  await searchCountry(searchValue);
});

cancelBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  searchInput.value = "";
  countriesContainer.innerHTML = "";
  const data = await fetchAndRenderCountries(
    `https://restcountries.com/v3.1/all?fields=name,flags,population,region,languages,currencies`
  );
  if (data.length === 0) return;

  data.sort((a, b) => a.name.common.localeCompare(b.name.common));

  data.forEach((country) => {
    renderCountry(country);
  });
  cancelBtn.classList.add("hidden");
});

countriesContainer.addEventListener("click", function (e) {
  const country = e.target.closest(".country");
  if (!country) return;
  const countryName = country.querySelector(".country__name").textContent;
  searchInput.value = countryName;
  searchBtn.click();
});

(async function () {
  const data = await fetchAndRenderCountries(
    `https://restcountries.com/v3.1/all?fields=name,flags,population,region,languages,currencies`
  );

  if (data.length === 0) return;

  data.sort((a, b) => a.name.common.localeCompare(b.name.common));
  data.forEach((country) => {
    renderCountry(country);
  });
})();
