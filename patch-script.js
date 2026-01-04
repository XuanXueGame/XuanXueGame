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
            const gameVersion = row.querySelectorAll('.date-badge')[0].textContent.toLowerCase();
            const gameDate = row.querySelectorAll('.date-badge')[1].textContent.toLowerCase();
            const isMatch = gameName.includes(searchTerm) || gameVersion.includes(searchTerm) || gameDate.includes(searchTerm);

            row.style.display = isMatch ? '' : 'none';
            row.dataset.match = isMatch; // 标记是否匹配搜索
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

        // 搜索后重新渲染分页，适配搜索结果
        initPagination();
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
}

// ========== ✅ 彻底修复 分页功能 完整版 - 核心功能全部补全，完美可用 ==========
function initPagination() {
    // 获取所有行 + 过滤掉搜索隐藏的行
    const allRows = Array.from(document.querySelectorAll('.game-row'));
    const rows = allRows.filter(row => row.dataset.match !== 'false' && row.style.display !== 'none');

    const pageNumbers = document.getElementById('pageNumbers');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const pageInfo = document.getElementById('pageInfo');
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');

    let currentPage = 1;
    let pageSize = parseInt(pageSizeSelect.value);
    let totalPages = rows.length > 0 ? Math.ceil(rows.length / pageSize) : 1;

    // 核心：渲染对应页码的内容，分页核心逻辑
    function renderPage(page) {
        // 1. 先隐藏所有行
        rows.forEach(row => {
            row.style.display = 'none';
        });

        // 2. 计算当前页要显示的起始和结束索引
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, rows.length);

        // 3. 只显示当前页的内容
        for (let i = startIndex; i < endIndex; i++) {
            rows[i].style.display = '';
        }

        // 4. 清空旧页码，重新生成页码按钮
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

        // 5. 更新分页信息文本
        pageInfo.textContent = `第 ${page} 页 / 共 ${totalPages} 页`;

        // 6. 控制上一页/下一页/首页/尾页的禁用状态
        firstPageBtn.disabled = page === 1;
        prevPageBtn.disabled = page === 1;
        nextPageBtn.disabled = page === totalPages;
        lastPageBtn.disabled = page === totalPages;
    }

    // 绑定分页按钮点击事件
    firstPageBtn.addEventListener('click', () => {
        currentPage = 1;
        renderPage(currentPage);
    });
    prevPageBtn.addEventListener('click', () => {
        if(currentPage > 1) currentPage--;
        renderPage(currentPage);
    });
    nextPageBtn.addEventListener('click', () => {
        if(currentPage < totalPages) currentPage++;
        renderPage(currentPage);
    });
    lastPageBtn.addEventListener('click', () => {
        currentPage = totalPages;
        renderPage(currentPage);
    });

    // 绑定每页条数下拉框切换事件
    pageSizeSelect.addEventListener('change', function () {
        pageSize = parseInt(this.value);
        totalPages = rows.length > 0 ? Math.ceil(rows.length / pageSize) : 1;
        currentPage = 1; // 切换条数后回到第一页
        renderPage(currentPage);
    });

    // 初始化渲染第一页
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
    autoSortByUpdateDate(); // 先排序
    initSearch(); // 再初始化搜索
    initPagination(); // 最后初始化分页
});