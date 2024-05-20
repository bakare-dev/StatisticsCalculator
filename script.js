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

    if (selectedOptions.includes("all")) {
        calculateStatistics(data);
    } else {
        selectedOptions.forEach(option => {
            switch (option) {
                case "mean":
                    const mean = calculateMean(data);
                    displayResult("Mean", mean);
                    break;
                case "median":
                    const median = calculateMedian(data);
                    displayResult("Median", median);
                    break;
                case "mode":
                    const mode = calculateMode(data);
                    displayResult("Mode", mode);
                    break;
                case "variance":
                    const variance = calculateVariance(data);
                    displayResult("Variance", variance);
                    break;
                case "stdDev":
                    const stdDev = calculateStdDev(data);
                    displayResult("Standard Deviation", stdDev);
                    break;
                case "skewness":
                    const skewness = calculateSkewness(data);
                    displayResult("Skewness", skewness);
                    break;
                default:
                    displayError("Invalid option selected.");
                    break;
            }
        });
    }
    renderCharts(data);
}

function calculateMean(data) {
    const total = data.reduce((a, b) => a + b.value * b.frequency, 0);
    const count = data.reduce((a, b) => a + b.frequency, 0);
    return total / count;
}

function calculateMedian(data) {
    const sortedData = data.slice().sort((a, b) => a.value - b.value);
    const n = sortedData.reduce((a, b) => a + b.frequency, 0);
    const mid = n / 2;
    let cumulativeFrequency = 0;
    let median;
    for (const item of sortedData) {
        cumulativeFrequency += item.frequency;
        if (cumulativeFrequency >= mid) {
            if (n % 2 === 0 && cumulativeFrequency === mid) {
                const nextItem = sortedData.find(({ value }) => value > item.value);
                median = (item.value + nextItem.value) / 2;
            } else {
                median = item.value;
            }
            break;
        }
    }
    return median;
}

function calculateMode(data) {
    let maxFrequency = 0;
    let modes = [];
    for (const item of data) {
        if (item.frequency > maxFrequency) {
            maxFrequency = item.frequency;
            modes = [item.value];
        } else if (item.frequency === maxFrequency) {
            modes.push(item.value);
        }
    }
    return modes.length === data.length ? "No mode" : modes.join(", ");
}

function calculateStatistics(data) {
    const mean = calculateMean(data);
    const median = calculateMedian(data);
    const mode = calculateMode(data);
    const variance = calculateVariance(data);
    const stdDev = calculateStdDev(data);
    const skewness = calculateSkewness(data);

    displayResult("Mean", mean);
    displayResult("Median", median);
    displayResult("Mode", mode);
    displayResult("Variance", variance);
    displayResult("Standard Deviation", stdDev);
    displayResult("Skewness", skewness);
}

function calculateVariance(data) {
    const mean = calculateMean(data);
    const variance = data.reduce((sum, { value, frequency }) => sum + frequency * Math.pow(value - mean, 2), 0) / data.reduce((a, b) => a + b.frequency, 0);
    return variance;
}

function calculateStdDev(data) {
    return Math.sqrt(calculateVariance(data));
}

function calculateSkewness(data) {
    const mean = calculateMean(data);
    const variance = calculateVariance(data);
    const stdDev = Math.sqrt(variance);
    const skewness = data.reduce((sum, { value, frequency }) => sum + frequency * Math.pow((value - mean) / stdDev, 3), 0) / data.reduce((a, b) => a + b.frequency, 0);
    return skewness;
}

function displayResult(name, value) {
    const resultsDiv = document.getElementById("results");
    const p = document.createElement("p");
    p.textContent = `${name}: ${value}`;
    resultsDiv.appendChild(p);
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
