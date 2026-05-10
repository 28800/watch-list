const CSV_PATH = "./data/gmt-watch-list.csv";

const table = document.getElementById("dataTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

const searchInput = document.getElementById("searchInput");

let rows = [];
let headers = [];

async function init() {
    try {
        const response = await fetch(CSV_PATH);

        if (!response.ok) {
            throw new Error("Failed to load CSV file.");
        }

        const csvText = await response.text();

        parseCSV(csvText);

        renderTable(rows);

        setupSearch();

    } catch (error) {
        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td class="empty">
                    Failed to load CSV file.
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

    headers = splitCSVLine(lines[0]);

    rows = lines.slice(1).map(line => {
        const values = splitCSVLine(line);

        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || "";
        });

        return row;
    });
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

function renderTable(data) {

    renderHeader();

    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${headers.length}" class="empty">
                    No matching entries found.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(row => {

        const tr = document.createElement("tr");

        headers.forEach(header => {

            const td = document.createElement("td");
            const value = row[header];

            const normalizedHeader = header
                .replace(/^\uFEFF/, "")
                .trim()
                .toLowerCase();

            if (normalizedHeader === "link" && value?.trim()) {

                let url = value.trim();

                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    url = "https://" + url;
                }

                const a = document.createElement("a");
                a.href = url;
                a.textContent = "Link";
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

function renderHeader() {

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
            .toLowerCase()
            .trim();

        if (!query) {
            renderTable(rows);
            return;
        }

        const filtered = rows.filter(row => {

            return Object.values(row)
                .some(value =>
                    value.toLowerCase().includes(query)
                );
        });

        renderTable(filtered);
    });
}

init();