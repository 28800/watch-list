const firstTable = document.getElementById("dataTable");
const secondTable = document.getElementById("secondTable");

const searchInput = document.getElementById("searchInput");

let firstTableData = null;
let secondTableData = null;

async function init() {

    await loadTable(
        "data/gmt-watch-list.csv",
        firstTable,
        "first"
    );

    await loadTable(
        "data/gmt-watch-list-alt.csv",
        secondTable,
        "second"
    );

    setupSearch();
}

async function loadTable(csvPath, tableElement, tableKey) {

    const thead = tableElement.querySelector("thead");
    const tbody = tableElement.querySelector("tbody");

    try {

        const response = await fetch(csvPath);

        if (!response.ok) {
            throw new Error(`Failed to load ${csvPath}`);
        }

        const csvText = await response.text();

        const parsed = parseCSV(csvText);

        renderTable(
            parsed.headers,
            parsed.rows,
            thead,
            tbody
        );

        if (tableKey === "first") {
            firstTableData = parsed;
        }

        if (tableKey === "second") {
            secondTableData = parsed;
        }

    } catch (error) {

        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td class="empty">
                    Failed to load table.
                </td>
            </tr>
        `;
    }
}

function parseCSV(csvText) {

    const lines = csvText
        .trim()
        .split("\n")
        .map(line => line.trim());

    const headers = splitCSVLine(lines[0]).map(header =>
        header
            .replace(/^\uFEFF/, "")
            .trim()
    );

    const rows = lines.slice(1).map(line => {

        const values = splitCSVLine(line);

        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || "";
        });

        return row;
    });

    return {
        headers,
        rows
    };
}

function splitCSVLine(line) {

    const result = [];

    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {

        const char = line[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (char === "," && !insideQuotes) {

            result.push(current);

            current = "";

            continue;
        }

        current += char;
    }

    result.push(current);

    return result;
}

function renderTable(headers, rows, thead, tbody) {

    renderHeader(headers, thead);

    tbody.innerHTML = "";

    if (rows.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="${headers.length}" class="empty">
                    No matching entries found.
                </td>
            </tr>
        `;

        return;
    }

    rows.forEach(row => {

        const tr = document.createElement("tr");

        headers.forEach(header => {

            const td = document.createElement("td");

            const value = row[header];

            const normalizedHeader = header
                .replace(/^\uFEFF/, "")
                .trim()
                .toLowerCase();

            if (
                normalizedHeader === "link" &&
                value?.trim()
            ) {

                let url = value.trim();

                if (
                    !url.startsWith("http://") &&
                    !url.startsWith("https://")
                ) {
                    url = "https://" + url;
                }

                const a = document.createElement("a");

                a.href = url;
                a.textContent = "link";

                a.target = "_blank";
                a.rel = "noopener noreferrer";

                td.appendChild(a);

            } else {

                td.textContent = value;
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

function renderHeader(headers, thead) {

    thead.innerHTML = "";

    const tr = document.createElement("tr");

    headers.forEach(header => {

        const th = document.createElement("th");

        th.textContent = header;

        tr.appendChild(th);
    });

    thead.appendChild(tr);
}

function setupSearch() {

    searchInput.addEventListener("input", event => {

        const query = event.target.value
            .trim()
            .toLowerCase();

        filterTable(
            firstTable,
            firstTableData,
            query
        );

        filterTable(
            secondTable,
            secondTableData,
            query
        );
    });
}

function filterTable(tableElement, tableData, query) {

    if (!tableData) {
        return;
    }

    const thead = tableElement.querySelector("thead");
    const tbody = tableElement.querySelector("tbody");

    if (!query) {

        renderTable(
            tableData.headers,
            tableData.rows,
            thead,
            tbody
        );

        return;
    }

    const filteredRows = tableData.rows.filter(row => {

        return Object.values(row).some(value =>
            value
                .toLowerCase()
                .includes(query)
        );
    });

    renderTable(
        tableData.headers,
        filteredRows,
        thead,
        tbody
    );
}

init();