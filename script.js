document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("data-type").addEventListener("change", function () {
        const dataType = this.value;
        document.getElementById("ungrouped-input").style.display = dataType === "ungrouped" ? "block" : "none";
        document.getElementById("grouped-input").style.display = dataType === "grouped" ? "block" : "none";
    });

    document.getElementById("data-form").addEventListener("submit", function (event) {
        event.preventDefault();
        const dataType = document.getElementById("data-type").value;

        if (dataType === "ungrouped") {
            const values = document.getElementById("data-values").value.split(",").map(Number);
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
            }
        });
    }
}

function calculateMean(data) {
    return data.reduce((a, b) => a + b.value * b.frequency, 0) / data.reduce((a, b) => a + b.frequency, 0);
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
    return data.reduce((sum, { value, frequency }) => sum + frequency * Math.pow(value - mean, 2), 0) / data.reduce((a, b) => a + b.frequency, 0);
}

function calculateStdDev(data) {
    return Math.sqrt(calculateVariance(data));
}

function calculateSkewness(data) {
    const mean = calculateMean(data);
    const variance = calculateVariance(data);
    const stdDev = Math.sqrt(variance);
    return data.reduce((sum, { value, frequency }) => sum + frequency * Math.pow((value - mean) / stdDev, 3), 0) / data.reduce((a, b) => a + b.frequency, 0);
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
