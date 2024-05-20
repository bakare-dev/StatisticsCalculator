document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("data-type").addEventListener("change", function () {
        const dataType = this.value;
        document.getElementById("ungrouped-input").style.display = dataType === "ungrouped" ? "block" : "none";
        document.getElementById("grouped-input").style.display = dataType === "grouped" ? "block" : "none";
    });

    document.getElementById("data-form").addEventListener("submit", function (event) {
        event.preventDefault();
        clearError();
        const dataType = document.getElementById("data-type").value;
        if (dataType === "ungrouped") {
            const dataValues = document.getElementById("data-values").value;
            if (!dataValues) {
                displayError("Please enter data values.");
                return;
            }
            const values = dataValues.split(",").map(Number);
            const data = values.filter(val => !isNaN(val));
            if (data.length === 0) {
                displayError("Please enter valid numeric data.");
                return;
            }
            const processedData = processData(data);
            solveSelected(processedData);
        } else if (dataType === "grouped") {
            const file = document.getElementById("data-file").files[0];
            if (!file) {
                displayError("Please upload a file.");
                return;
            }
            if (file.type !== "text/csv") {
                displayError("Please upload a valid CSV file.");
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                const contents = e.target.result;
                const rows = contents.split("\n");
                const data = rows.map(row => {
                    const [value, frequency] = row.split(",").map(Number);
                    return { value, frequency };
                }).filter(item => !isNaN(item.value) && !isNaN(item.frequency));
                if (data.length === 0) {
                    displayError("File does not contain valid numeric data.");
                    return;
                }
                solveSelected(data);
            };
            reader.readAsText(file);
        }
    });
});

function processData(data) {
    const valueFrequencyMap = {};
    data.forEach(value => {
        if (valueFrequencyMap[value]) {
            valueFrequencyMap[value]++;
        } else {
            valueFrequencyMap[value] = 1;
        }
    });
    const valueFrequencyArray = Object.entries(valueFrequencyMap).map(([value, frequency]) => ({
        value: parseFloat(value),
        frequency
    }));
    return valueFrequencyArray;
}

function solveSelected(data) {
    const selectedOptions = Array.from(document.getElementById("solve-options").selectedOptions).map(option => option.value);
    clearResults();
    if (selectedOptions.length === 0 || selectedOptions[0] === "") {
        displayError("Please select at least one option to solve.");
        return;
    }
    const results = {};
    if (selectedOptions.includes("all")) {
        results.mean = calculateMean(data);
        results.median = calculateMedian(data);
        results.mode = calculateMode(data);
        results.variance = calculateVariance(data);
        results.stdDev = calculateStdDev(data);
        results.skewness = calculateSkewness(data);
    } else {
        selectedOptions.forEach(option => {
            switch (option) {
                case "mean":
                    results.mean = calculateMean(data);
                    break;
                case "median":
                    results.median = calculateMedian(data);
                    break;
                case "mode":
                    results.mode = calculateMode(data);
                    break;
                case "variance":
                    results.variance = calculateVariance(data);
                    break;
                case "stdDev":
                    results.stdDev = calculateStdDev(data);
                    break;
                case "skewness":
                    results.skewness = calculateSkewness(data);
                    break;
                default:
                    displayError("Invalid option selected.");
                    break;
            }
        });
    }
    displayResults(results);
    renderCharts(data);
}

function calculateMean(data) {
    const total = data.reduce((sum, item) => sum + item.value * item.frequency, 0);
    const count = data.reduce((sum, item) => sum + item.frequency, 0);
    return total / count;
}

function calculateMedian(data) {
    const sortedData = data.slice().sort((a, b) => a.value - b.value);
    const n = sortedData.reduce((sum, item) => sum + item.frequency, 0);
    const mid = n / 2;
    let cumulativeFrequency = 0;
    for (const item of sortedData) {
        cumulativeFrequency += item.frequency;
        if (cumulativeFrequency >= mid) {
            if (n % 2 === 0 && cumulativeFrequency === mid) {
                const nextItem = sortedData.find(({ value }) => value > item.value);
                return (item.value + nextItem.value) / 2;
            }
            return item.value;
        }
    }
}

function calculateMode(data) {
    let maxFrequency = 0;
    let modes = [];
    data.forEach(item => {
        if (item.frequency > maxFrequency) {
            maxFrequency = item.frequency;
            modes = [item.value];
        } else if (item.frequency === maxFrequency) {
            modes.push(item.value);
        }
    });
    return modes.length === data.length ? "No mode" : modes.join(", ");
}

function calculateVariance(data) {
    const mean = calculateMean(data);
    return data.reduce((sum, { value, frequency }) => sum + frequency * Math.pow(value - mean, 2), 0) / data.reduce((a, b) => a + b.frequency, 0);
}

function calculateStdDev(data) {
    return Math.sqrt(calculateVariance(data));
}

function calculateSkewness(data) {
    const mean = calculateMean(data);
    const stdDev = calculateStdDev(data);
    return data.reduce((sum, { value, frequency }) => sum + frequency * Math.pow((value - mean) / stdDev, 3), 0) / data.reduce((a, b) => a + b.frequency, 0);
}

function displayResults(results) {
    const resultsDiv = document.getElementById("results");
    for (const [key, value] of Object.entries(results)) {
        const p = document.createElement("p");
        p.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        resultsDiv.appendChild(p);
    }
    document.getElementById("download-results").style.display = "block";
}

function clearResults() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
}

function displayError(message) {
    const errorDiv = document.getElementById("error");
    errorDiv.textContent = message;
}

function clearError() {
    const errorDiv = document.getElementById("error");
    errorDiv.textContent = "";
}

function renderCharts(data) {
    const labels = data.map(d => d.value);
    const frequencies = data.map(d => d.frequency);
    const chartType = document.getElementById("chart-type").value;
    const chartCanvas = document.getElementById("chartCanvas");

    if (window.chart) {
        window.chart.destroy();
    }

    if (!chartType) {
        document.getElementById('charts').style.display = 'none';
        document.getElementById('download-chart').style.display = 'none';
        return;
    }

    document.getElementById('charts').style.display = 'block';
    document.getElementById('download-chart').style.display = 'block';

    const ctx = chartCanvas.getContext('2d');
    const chartConfig = {
        type: chartType === 'histogram' ? 'bar' : 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: frequencies,
                backgroundColor: labels.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`),
                borderColor: labels.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`),
                borderWidth: 1
            }]
        },
        options: chartType === 'histogram' ? {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        } : {}
    };

    window.chart = new Chart(ctx, chartConfig);

    document.getElementById('download-chart').addEventListener('click', function () {
        const link = document.createElement('a');
        link.href = window.chart.toBase64Image();
        link.download = chartType + '.png';
        link.click();
    });
}


function downloadResults() {
    const resultsDiv = document.getElementById('results');
    const resultsText = Array.from(resultsDiv.children).map(p => p.textContent).join("\n");
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'results.txt';
    link.click();
}
