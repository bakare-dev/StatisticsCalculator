document.getElementById('data-type').addEventListener('change', function () {
    const dataType = this.value;
    document.getElementById('ungrouped-input').style.display = dataType === 'ungrouped' ? 'block' : 'none';
    document.getElementById('grouped-input').style.display = dataType === 'grouped' ? 'block' : 'none';
});

document.getElementById('data-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const dataType = document.getElementById('data-type').value;
    let data = [];

    if (dataType === 'ungrouped') {
        const values = document.getElementById('data-values').value.split(',').map(Number);
        data = values.filter(val => !isNaN(val));
        calculateStatistics(data, false);
    } else if (dataType === 'grouped') {
        const file = document.getElementById('data-file').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const contents = e.target.result;
                const rows = contents.split('\n');
                data = rows.map(row => {
                    const [value, frequency] = row.split(',').map(Number);
                    return { value, frequency };
                }).filter(item => !isNaN(item.value) && !isNaN(item.frequency));
                calculateStatistics(data, true);
            };
            reader.readAsText(file);
        }
    }
});

function calculateStatistics(data, isGrouped) {
    if (isGrouped) {
        data = data.flatMap(item => Array(item.frequency).fill(item.value));
    }

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const median = calculateMedian(data);
    const mode = calculateMode(data);
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const skewness = (data.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 3), 0) * data.length) / ((data.length - 1) * (data.length - 2));

    displayResults({ mean, median, mode, variance, stdDev, skewness });
}

function calculateMedian(values) {
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2.0;
}

function calculateMode(values) {
    const frequency = {};
    let maxFreq = 0;
    let modes = [];
    values.forEach(value => {
        frequency[value] = (frequency[value] || 0) + 1;
        if (frequency[value] > maxFreq) {
            maxFreq = frequency[value];
        }
    });
    for (const key in frequency) {
        if (frequency[key] === maxFreq) {
            modes.push(Number(key));
        }
    }
    return modes.length === values.length ? [] : modes;
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Results:</h2>
        <p>Mean: ${results.mean}</p>
        <p>Median: ${results.median}</p>
        <p>Mode: ${results.mode.length > 0 ? results.mode.join(', ') : 'No mode'}</p>
        <p>Variance: ${results.variance}</p>
        <p>Standard Deviation: ${results.stdDev}</p>
        <p>Skewness: ${results.skewness}</p>
    `;
}
