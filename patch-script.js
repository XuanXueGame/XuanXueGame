// ========== 搜索功能 增强版 - 搜索补丁名称/游戏版本/更新日期 ==========
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
            noResultsRow.innerHTML = '<td colspan="4">🔍 没有找到匹配的补丁，请尝试更换关键词搜索</td>';
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

// ========== 修复BUG的分页功能 - 永远显示所有补丁列表 ==========
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

// ========== ✅ 补丁页新增：自动按更新时间从新到旧排序 ==========
function autoSortByUpdateDate() {
    const gamesList = document.getElementById('games-list');
    const gameRows = Array.from(document.querySelectorAll('.game-row'));
    function formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    gameRows.sort((a, b) => {
        const aDate = formatDate(a.querySelectorAll('.date-badge')[1].innerText);
        const bDate = formatDate(b.querySelectorAll('.date-badge')[1].innerText);
        return new Date(bDate) - new Date(aDate);
    });
    gamesList.innerHTML = '';
    gameRows.forEach(row => gamesList.appendChild(row));
}

// ========== 补丁页加载执行顺序 ==========
document.addEventListener('DOMContentLoaded', function () {
    autoSortByUpdateDate();
    initSearch();
    initPagination();
});