window.addEventListener('DOMContentLoaded', () => {
  const bannerImage = document.getElementById('banner-image');
  const bannerTitle = document.getElementById('banner-title');
  const bannerDiscount = document.getElementById('banner-discount');
  const bannerDescription = document.getElementById('banner-description');
  const bannerPrice = document.getElementById('banner-price');
  const bannerNormalPrice = document.getElementById('banner-normal-price');
  const bannerStore = document.getElementById('banner-store');
  const bannerLink = document.getElementById('banner-link');

  const loader = document.getElementById('loader-wrapper');
  const gamesContainer = document.getElementById('games-container');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const themeToggle = document.getElementById('theme-toggle');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  const statsTotal = document.getElementById('stats-total');
  const statsAverage = document.getElementById('stats-average');
  const statsBest = document.getElementById('stats-best');
  const statsUnique = document.getElementById('stats-unique');

  const API_URL = 'https://www.cheapshark.com/api/1.0/deals?pageSize=32';

  let games = [];

  const storeNames = {
    1: 'Steam',
    2: 'GamersGate',
    3: 'GreenManGaming',
    4: 'Amazon',
    5: 'GameStop',
    6: 'Direct2Drive',
    7: 'GOG',
    8: 'Origin',
    9: 'Get Games',
    10: 'Shiny Loot',
    11: 'Humble Store',
    12: 'Desura',
    13: 'Uplay',
    14: 'IndieGameStand',
    15: 'Fanatical',
    16: 'Gamesrocket',
    17: 'Games Republic',
    18: 'SilaGames',
    19: 'Playfield',
    20: 'ImperialGames',
    21: 'WinGameStore',
    22: 'FunStockDigital',
    23: 'GameBillet',
    24: 'Voidu',
    25: 'Epic Games Store',
    26: 'Razer Game Store',
    27: 'Gamesplanet',
    28: 'Gamesload',
    29: '2Game',
    30: 'IndieGala',
    31: 'Blizzard Shop',
    32: 'AllYouPlay',
    33: 'DLGamer',
    34: 'Noctre',
    35: 'DreamGame'
  };

  function formatPrice(price) {
    return `$${Number(price).toFixed(2)}`;
  }

  function getStoreName(storeID) {
    return storeNames[Number(storeID)] || `Store #${storeID}`;
  }

  function updateStats(list) {
    const total = list.length;
    const averageDiscount = total
      ? Math.floor(list.reduce((sum, item) => sum + Number(item.savings), 0) / total)
      : 0;
    const bestDiscount = total
      ? Math.floor(Math.max(...list.map(item => Number(item.savings))))
      : 0; 

    statsTotal.textContent = total;
    statsAverage.textContent = `${averageDiscount}%`;
    statsBest.textContent = `${bestDiscount}%`;
    statsUnique.textContent = total;
  }

  function setBanner(game) {
    if (!game) return;

    bannerImage.src = game.thumb;
    bannerImage.alt = game.title;
    bannerTitle.textContent = game.title;
    bannerDiscount.textContent = `${Math.floor(Number(game.savings))}% скидка`;
    bannerDescription.textContent = `Текущая цена: ${formatPrice(game.salePrice)}. Старая цена: ${formatPrice(game.normalPrice)}. Магазин: ${getStoreName(game.storeID)}.`;
    bannerPrice.textContent = formatPrice(game.salePrice);
    bannerNormalPrice.textContent = formatPrice(game.normalPrice);
    bannerStore.textContent = getStoreName(game.storeID);
    bannerLink.href = `https://www.cheapshark.com/redirect?dealID=${game.dealID}`;
  }

  function createCard(game) {
    return `
      <a
        href="https://www.cheapshark.com/redirect?dealID=${game.dealID}"
        target="_blank"
        rel="noopener noreferrer"
        class="game-card block"
      >
        <img src="${game.thumb}" alt="${game.title}" class="game-thumb" />
        <div class="p-4">
          <div class="mb-3 flex flex-wrap gap-2">
            <span class="badge badge-store">${getStoreName(game.storeID)}</span>
            <span class="badge badge-discount">-${Math.floor(Number(game.savings))}%</span>
          </div>

          <h3 class="text-lg font-semibold leading-6 text-white line-2 min-h-[56px]">
            ${game.title}
          </h3>

          <div class="mt-4 flex items-end justify-between gap-3">
            <div>
              <p class="text-2xl font-bold text-blue-400">${formatPrice(game.salePrice)}</p>
              <p class="price-old">${formatPrice(game.normalPrice)}</p>
            </div>
            <span class="rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-200">Купить</span>
          </div>
        </div>
      </a>
    `;
  }

  function renderGames(list) {
    if (!list.length) {
      gamesContainer.innerHTML = `
        <div class="col-span-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
          Ничего не найдено. Попробуйте другой запрос.
        </div>
      `;
      return;
    }

    gamesContainer.innerHTML = list.map(createCard).join('');
  }

  function filterAndSortGames() {
    const query = searchInput.value.trim().toLowerCase();
    const sortType = sortSelect.value;

    let filtered = games.filter(game =>
      game.title.toLowerCase().includes(query)
    );

    if (sortType === 'discount') {
      filtered.sort((a, b) => Number(b.savings) - Number(a.savings));
    } else if (sortType === 'price-low') {
      filtered.sort((a, b) => Number(a.salePrice) - Number(b.salePrice));
    } else if (sortType === 'price-high') {
      filtered.sort((a, b) => Number(b.salePrice) - Number(a.salePrice));
    } else if (sortType === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderGames(filtered);
    updateStats(filtered);
  }

  async function fetchGames() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Ошибка загрузки API');

      const data = await res.json();

      games = data.filter((game, index, arr) =>
        index === arr.findIndex(item => item.title === game.title)
      );

      const randomGame = games[Math.floor(Math.random() * games.length)];

      setBanner(randomGame);
      renderGames(games);
      updateStats(games);
    } catch (err) {
      console.error('Games error:', err);
      gamesContainer.innerHTML = `
        <div class="col-span-full rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200">
          Не удалось загрузить игры. Проверьте интернет или API.
        </div>
      `;
    } finally {
      setTimeout(() => {
        loader.style.display = 'none';
      }, 700);
    }
  }

  searchInput.addEventListener('input', filterAndSortGames);
  sortSelect.addEventListener('change', filterAndSortGames);

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.remove('hidden');
    } else {
      scrollTopBtn.classList.add('hidden');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  fetchGames();
});