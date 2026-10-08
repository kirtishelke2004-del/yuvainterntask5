document.addEventListener('DOMContentLoaded', () => {
    let dashboardData = [];

    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    const statusAnnouncer = document.getElementById('statusAnnouncer');

    const totalCountEl = document.getElementById('totalCount');
    const avgScoreEl = document.getElementById('avgScore');
    const completedCountEl = document.getElementById('completedCount');

    // 1. Fetch Dynamic Data from JSON
    async function loadDashboardData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Failed to load dataset.');
            dashboardData = await response.json();
            renderDashboard(dashboardData);
        } catch (error) {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Failed to load dynamic data. Please check data.json file.</td></tr>`;
        }
    }

    // 2. Render Table & Metrics
    function renderDashboard(data) {
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No matching records found.</td></tr>`;
            updateSummaryCards([]);
            statusAnnouncer.textContent = 'Filtered view: 0 records found.';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.title}</strong></td>
                <td><span class="badge">${item.category}</span></td>
                <td>${item.status}</td>
                <td><strong>${item.performance}%</strong></td>
                <td>${item.date}</td>
            `;
            tableBody.appendChild(row);
        });

        updateSummaryCards(data);
        statusAnnouncer.textContent = `Displaying ${data.length} records in dashboard table.`;
    }

    // 3. Update Dynamic Metrics
    function updateSummaryCards(data) {
        totalCountEl.textContent = data.length;

        if (data.length === 0) {
            avgScoreEl.textContent = '0%';
            completedCountEl.textContent = '0';
            return;
        }

        const totalScore = data.reduce((acc, curr) => acc + curr.performance, 0);
        const avg = (totalScore / data.length).toFixed(1);
        const completed = data.filter(item => item.status === 'Completed').length;

        avgScoreEl.textContent = `${avg}%`;
        completedCountEl.textContent = completed;
    }

    // 4. Filtering & Sorting Logic
    function filterAndSortData() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        const sortOrder = sortSelect.value;

        let filtered = dashboardData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        if (sortOrder === 'high') {
            filtered.sort((a, b) => b.performance - a.performance);
        } else if (sortOrder === 'low') {
            filtered.sort((a, b) => a.performance - b.performance);
        }

        renderDashboard(filtered);
    }

    // Event Listeners with Debounce for Search
    function debounce(func, delay = 250) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    searchInput.addEventListener('input', debounce(filterAndSortData));
    categoryFilter.addEventListener('change', filterAndSortData);
    sortSelect.addEventListener('change', filterAndSortData);

    // 5. Theme Toggle Implementation
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeBtnText = document.getElementById('themeBtnText');

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggleBtn.setAttribute('aria-pressed', 'false');
            themeBtnText.textContent = '🌙 Dark Mode';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggleBtn.setAttribute('aria-pressed', 'true');
            themeBtnText.textContent = '☀️ Light Mode';
        }
    });

    loadDashboardData();
});