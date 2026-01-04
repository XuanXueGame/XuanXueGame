// ===================== ✅ 闭包封装 - 消除全局变量污染 ✅ =====================
(function () {
    // 常量定义 - 所有固定配置/选择器集中管理，便于维护
    const CONST = {
        PAGE_SIZE_DEFAULT: 15,
        EMPTY_TIP: '<tr class="no-results"><td colspan="4">🔍 没有找到匹配的游戏，请更换关键词重试</td></tr>',
        SELECTOR: {
            gameList: '#games-list',
            searchInput: '#search-input',
            pageSizeSelect: '#pageSizeSelect',
            pageInfo: '#pageInfo',
            pageNumbers: '#pageNumbers',
            firstPage: '#firstPage',
            prevPage: '#prevPage',
            nextPage: '#nextPage',
            lastPage: '#lastPage',
            totalGameCount: '#totalGameCount',
            ucCount: '#ucCount',
            bdCount: '#bdCount',
            kuakeCount: '#kuakeCount',
            xunleiCount: '#xunleiCount'
        }
    };

    // 私有状态数据 - 只在闭包内生效，安全不冲突
    let state = {
        allGameData: [],  // 原始游戏全量数据 (永久缓存)
        currentPage: 1,   // 当前页码
        pageSize: CONST.PAGE_SIZE_DEFAULT, // 每页条数
        tbody: document.querySelector(CONST.SELECTOR.gameList)
    };

    // ===================== 1. 初始化游戏数据 - 读取DOM并格式化缓存 =====================
    function initGameData() {
        const trNodes = document.querySelectorAll('.game-row');
        trNodes.forEach(tr => {
            const name = tr.querySelector('.game-name').textContent.trim();
            const version = tr.querySelectorAll('.date-badge')[0].textContent.trim();
            const date = tr.querySelectorAll('.date-badge')[1].textContent.trim();
            const linksHtml = tr.querySelector('.links-container').innerHTML.trim();

            state.allGameData.push({
                name, version, date, linksHtml,
                uc: linksHtml.includes('icon-uc'),
                bd: linksHtml.includes('icon-bd'),
                kuake: linksHtml.includes('icon-kuake'),
                xunlei: linksHtml.includes('icon-xunlei')
            });
        });
        state.tbody.innerHTML = ''; // 清空原始DOM，后续由JS渲染
    }

    // ===================== 2. 统计数据 - 总游戏数+各网盘链接数 =====================
    function calcAndRenderCount() {
        const { allGameData } = state;
        const countObj = { total: allGameData.length, uc:0, bd:0, kuake:0, xunlei:0 };

        allGameData.forEach(item => {
            item.uc && countObj.uc++;
            item.bd && countObj.bd++;
            item.kuake && countObj.kuake++;
            item.xunlei && countObj.xunlei++;
        });

        // 渲染统计数据
        document.querySelector(CONST.SELECTOR.totalGameCount).textContent = countObj.total;
        document.querySelector(CONST.SELECTOR.ucCount).textContent = countObj.uc;
        document.querySelector(CONST.SELECTOR.bdCount).textContent = countObj.bd;
        document.querySelector(CONST.SELECTOR.kuakeCount).textContent = countObj.kuake;
        document.querySelector(CONST.SELECTOR.xunleiCount).textContent = countObj.xunlei;
    }

    // ===================== 3. 按更新日期排序 - 新 → 旧 =====================
    function sortGameByDate() {
        state.allGameData.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // ===================== 4. 搜索过滤 + 关键词高亮 ✨新增核心功能 =====================
    function filterGameData() {
        const keyword = document.querySelector(CONST.SELECTOR.searchInput).value.toLowerCase().trim();
        if (!keyword) return state.allGameData;

        // 过滤匹配数据
        return state.allGameData.filter(item => {
            return item.name.toLowerCase().includes(keyword) ||
                item.version.toLowerCase().includes(keyword) ||
                item.date.includes(keyword);
        }).map(item => {
            // 关键词高亮处理
            const reg = new RegExp(keyword, 'gi');
            return {
                ...item,
                name: item.name.replace(reg, match => `<span class="mark-text">${match}</span>`),
                version: item.version.replace(reg, match => `<span class="mark-text">${match}</span>`),
                date: item.date.replace(reg, match => `<span class="mark-text">${match}</span>`)
            };
        });
    }

    // ===================== 5. 分页核心渲染 - 唯一渲染入口，性能最优 =====================
    function renderGameTable() {
        const { currentPage, pageSize, tbody } = state;
        const filterData = filterGameData();
        const total = filterData.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        // 页码边界安全处理
        state.currentPage = Math.max(1, Math.min(currentPage, totalPages));
        const start = (state.currentPage - 1) * pageSize;
        const pageData = filterData.slice(start, start + pageSize);

        // 拼接表格HTML
        let tableHtml = '';
        if (total === 0) {
            tableHtml = CONST.EMPTY_TIP;
        } else {
            pageData.forEach(item => {
                tableHtml += `
                <tr class="game-row">
                    <td><span class="game-name">${item.name}</span></td>
                    <td><span class="date-badge">${item.version}</span></td>
                    <td><span class="date-badge">${item.date}</span></td>
                    <td><div class="links-container">${item.linksHtml}</div></td>
                </tr>
                `;
            });
        }

        // 一次性更新DOM，减少回流重绘 → 性能暴增
        tbody.innerHTML = tableHtml;
        // 更新分页控件
        renderPagination(totalPages);
    }

    // ===================== 6. 分页控件渲染 =====================
    function renderPagination(totalPages) {
        const { currentPage } = state;
        // 更新分页文本
        document.querySelector(CONST.SELECTOR.pageInfo).textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
        // 渲染页码按钮
        const pageNumBox = document.querySelector(CONST.SELECTOR.pageNumbers);
        pageNumBox.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => { state.currentPage = i; renderGameTable(); };
            pageNumBox.appendChild(btn);
        }
        // 更新分页按钮禁用状态
        const disabled = currentPage === 1;
        const disabledLast = currentPage === totalPages;
        document.querySelector(CONST.SELECTOR.firstPage).disabled = disabled;
        document.querySelector(CONST.SELECTOR.prevPage).disabled = disabled;
        document.querySelector(CONST.SELECTOR.nextPage).disabled = disabledLast;
        document.querySelector(CONST.SELECTOR.lastPage).disabled = disabledLast;
    }

    // ===================== 7. 绑定所有事件 - 集中管理，逻辑清晰 =====================
    function bindEvents() {
        const searchInput = document.querySelector(CONST.SELECTOR.searchInput);
        const pageSizeSelect = document.querySelector(CONST.SELECTOR.pageSizeSelect);

        // 搜索事件：输入+回车均可触发，输入后重置页码为1
        searchInput.addEventListener('input', () => {
            state.currentPage = 1;
            renderGameTable();
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                state.currentPage = 1;
                renderGameTable();
            }
        });

        // 每页条数切换事件
        pageSizeSelect.addEventListener('change', () => {
            state.pageSize = parseInt(pageSizeSelect.value);
            state.currentPage = 1;
            renderGameTable();
        });

        // 分页按钮事件
        document.querySelector(CONST.SELECTOR.firstPage).onclick = () => { state.currentPage = 1; renderGameTable(); };
        document.querySelector(CONST.SELECTOR.prevPage).onclick = () => { state.currentPage--; renderGameTable(); };
        document.querySelector(CONST.SELECTOR.nextPage).onclick = () => { state.currentPage++; renderGameTable(); };
        document.querySelector(CONST.SELECTOR.lastPage).onclick = () => {
            state.currentPage = Math.ceil(filterGameData().length / state.pageSize);
            renderGameTable();
        };
    }

    // ===================== 入口函数 - 执行顺序严格，初始化所有逻辑 =====================
    function init() {
        initGameData();  // 1. 读取数据
        sortGameByDate();// 2. 排序数据
        calcAndRenderCount(); // 3. 统计数据
        bindEvents();    // 4. 绑定事件
        renderGameTable();//5. 渲染页面
    }

    // 页面加载完成后执行初始化
    document.addEventListener('DOMContentLoaded', init);
})();