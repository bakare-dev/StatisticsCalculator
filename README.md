# Statistics Calculator

This web application allows users to calculate basic statistics (mean, median, mode, variance, standard deviation, and skewness) for both ungrouped and grouped data. The application provides options for direct input of data values or uploading a CSV file for grouped data. Below are detailed instructions on how to use the application and a brief overview of its functionality.

## Getting Started
To start using the Statistics Calculator, simply open the `index.html` file in your web browser. Ensure that `style.css` and `script.js` files are in the same directory as `index.html` for the application to function correctly.
## Features
- **Ungrouped Data Input**: Users can enter ungrouped data values directly as comma-separated values.
- **Grouped Data Input**: Users can upload a CSV file containing grouped data values and their frequencies.
- **Statistics Calculation**: The application calculates and displays the mean, median, mode, variance, standard deviation, and skewness for the provided data.
- **Result Export**: Users can download the calculated statistics results as a .txt file.
- **Chart Export**: Users can download the displayed chart as a .png image.

## Usage

### Ungrouped Data
1. Select "Ungrouped" from the "Data Type" dropdown menu.
2. Enter your data values as a comma-separated list in the "Enter Values" input field.
3. Click the "Calculate" button to compute the statistics.
4. The results will be displayed below the form.

### Grouped Data
1. Select "Grouped" from the "Data Type" dropdown menu.
2. Upload a CSV file containing your data. The file should follow the specified format (see below).
3. Click the "Calculate" button to compute the statistics.
4. The results will be displayed below the form.

## File Format
For grouped data, the CSV file should contain two columns:
- The first column represents the data values.
- The second column represents the frequency of each data value.

Each row should be formatted as:
```
value,frequency
```
For example:
```
10,5
20,3
30,7
```

## Technical Details

### HTML Structure
The HTML structure includes a form with input fields for both ungrouped and grouped data. The appropriate input fields are shown or hidden based on the selected data type.

### CSS Styling
The CSS file `style.css` styles the application to make it visually appealing and user-friendly.

### JavaScript Functionality
The JavaScript file `script.js` handles the core functionality:
- **Event Listeners**: Listens for changes in the data type dropdown and form submissions.
- **Data Processing**: Processes the input data, calculates the required statistics, and displays the results.
- **Statistics Calculations**: Includes functions to calculate the mean, median, mode, variance, standard deviation, and skewness.

#### Event Handling
- The change event on the data type dropdown shows or hides the appropriate input fields.
- The submit event on the form processes the data and calculates the statistics.

#### File Reading
For grouped data, the FileReader API is used to read the uploaded CSV file, parse its contents, and extract the data values and frequencies.

#### Calculation Functions
- `calculateStatistics(data, isGrouped)`: Main function to calculate and display statistics. It handles both ungrouped and grouped data.
- `calculateMedian(values)`: Calculates the median of the given values.
- `calculateMode(values)`: Calculates the mode(s) of the given values.
- `displayResults(results)`: Displays the calculated results on the webpage.

#### Chart Export
- Users can export the displayed chart as a .png image by clicking the "Download Chart" button.
- The chart will be downloaded with the selected chart type (histogram or pie chart) as the filename.

#### Result Export
- Users can export the calculated statistics results as a .txt file by clicking the "Download Results" button.
- The results will be downloaded in a plain text format with each statistic listed on a separate line.

## Conclusion
The Statistics Calculator is a straightforward tool for computing basic statistical measures for both ungrouped and grouped data. By following the instructions above, users can easily input their data, calculate the necessary statistics, and view the results instantly.
