// ========== 自动统计 总游戏数 + 各网盘链接数量 函数 ==========
function countGamesAndLinks() {
    const totalGameCount = document.getElementById('totalGameCount');
    if(!totalGameCount) return;

    const allGameRows = document.querySelectorAll('.game-row');
    let totalGame = allGameRows.length;
    let ucLink = 0, bdLink = 0, kuakeLink = 0, xunleiLink = 0;

    allGameRows.forEach(row => {
        const links = row.querySelectorAll('.links-container a');
        links.forEach(link => {
            const icon = link.querySelector('i');
            if(icon.classList.contains('icon-uc')) ucLink++;
            if(icon.classList.contains('icon-bd')) bdLink++;
            if(icon.classList.contains('icon-kuake')) kuakeLink++;
            if(icon.classList.contains('icon-xunlei')) xunleiLink++;
        });
    });

    document.getElementById('totalGameCount').innerText = totalGame;
    document.getElementById('ucCount').innerText = ucLink;
    document.getElementById('bdCount').innerText = bdLink;
    document.getElementById('kuakeCount').innerText = kuakeLink;
    document.getElementById('xunleiCount').innerText = xunleiLink;
}

// ========== 搜索功能 增强版 - 支持游戏名+版本+日期多字段模糊搜索 ==========
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const gameRows = document.querySelectorAll('.game-row');
    const gamesList = document.getElementById('games-list');

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();
        let visibleCount = 0;

        gameRows.forEach(row => {
            const gameName = row.querySelector('.game-name').textContent.toLowerCase();
            const gameVersion = row.querySelector('.date-badge').textContent.toLowerCase();
            const gameDate = row.querySelectorAll('.date-badge')[1].textContent.toLowerCase();
            const isMatch = gameName.includes(searchTerm) || gameVersion.includes(searchTerm) || gameDate.includes(searchTerm);

            row.style.display = isMatch ? '' : 'none';
            if(isMatch) visibleCount++;
        });

        const oldNoResult = document.querySelector('.no-results');
        if (oldNoResult) oldNoResult.remove();

        if (visibleCount === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.className = 'no-results';
            noResultsRow.innerHTML = '<td colspan="4">🔍 没有找到匹配的游戏，请尝试更换关键词搜索</td>';
            gamesList.appendChild(noResultsRow);
        }
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
}

// ========== 分页功能 - 修复BUG，永不隐藏游戏列表 ==========
function initPagination() {
    const rows = Array.from(document.querySelectorAll('.game-row'));
    const pageNumbers = document.getElementById('pageNumbers');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const pageInfo = document.getElementById('pageInfo');
    let currentPage = 1;
    let pageSize = parseInt(pageSizeSelect.value);
    let totalPages = Math.ceil(rows.length / pageSize);

    function renderPage(page) {
        rows.forEach(row => row.style.display = '');
        pageNumbers.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${i === page ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderPage(currentPage);
            });
            pageNumbers.appendChild(btn);
        }

        pageInfo.textContent = `第 ${page} 页 / 共 ${totalPages} 页`;
        document.getElementById('firstPage').disabled = page === 1;
        document.getElementById('prevPage').disabled = page === 1;
        document.getElementById('nextPage').disabled = page === totalPages;
        document.getElementById('lastPage').disabled = page === totalPages;
    }

    document.getElementById('firstPage').addEventListener('click', () => { currentPage=1; renderPage(1) });
    document.getElementById('prevPage').addEventListener('click', () => { if(currentPage>1) currentPage--; renderPage(currentPage) });
    document.getElementById('nextPage').addEventListener('click', () => { if(currentPage<totalPages) currentPage++; renderPage(currentPage) });
    document.getElementById('lastPage').addEventListener('click', () => { currentPage=totalPages; renderPage(totalPages) });

    pageSizeSelect.addEventListener('change', function () {
        pageSize = parseInt(this.value);
        totalPages = Math.ceil(rows.length / pageSize);
        currentPage = 1;
        renderPage(currentPage);
    });

    renderPage(currentPage);
}

// ========== ✅ 核心新增：页面加载自动按【更新时间从新到旧】排序 无按钮 纯自动 ==========
function autoSortByUpdateDate() {
    const gamesList = document.getElementById('games-list');
    const gameRows = Array.from(document.querySelectorAll('.game-row'));
    // 日期格式化兼容方法：统一转成 2026-01-01 标准格式，避免 2026-1-1 排序错误
    function formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    // 排序核心逻辑：从新到旧 (最新日期排在最前面)
    gameRows.sort((a, b) => {
        const aDate = formatDate(a.querySelectorAll('.date-badge')[1].innerText);
        const bDate = formatDate(b.querySelectorAll('.date-badge')[1].innerText);
        return new Date(bDate) - new Date(aDate);
    });
    // 重新渲染排序后的游戏列表
    gamesList.innerHTML = '';
    gameRows.forEach(row => gamesList.appendChild(row));
}

// ========== 页面加载执行顺序：先自动排序 → 再统计 → 再初始化其他功能 ==========
document.addEventListener('DOMContentLoaded', function () {
    autoSortByUpdateDate(); // ✅ 第一步：自动排序（核心）
    countGamesAndLinks();   // ✅ 第二步：排序后统计数量
    initSearch();           // ✅ 第三步：初始化搜索
    initPagination();       // ✅ 第四步：初始化分页
});