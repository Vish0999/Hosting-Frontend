import { useState } from "react";
import "./App.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("BACKEND RESPONSE 👉", data);

      setResult(data);
    } catch (error) {
      console.error("Error while analyzing CSV:", error);
    }
  };




const handleDownloadPDF = async () => {
  if (!file) {
    alert("Upload CSV first");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_URL}/download-pdf`, {
    method: "POST",
    body: formData,
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "data_insights.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
};








  const generateStatements = () => {
  if (!result) return [];

  const statements = [];

  Object.keys(result).forEach((column) => {
    const colData = result[column];

    // NUMERIC COLUMN
    if (colData.mean !== null && colData.mean !== undefined) {
      statements.push(
        `${column} has ${colData.count} total records.`,
        `The average value of ${column} is ${colData.mean.toFixed(2)}.`,
        `The minimum value of ${column} is ${colData.min}.`,
        `The maximum value of ${column} is ${colData.max}.`,
        `50% of the values in ${column} are less than ${colData["50%"]}.`,
        `25% of the values in ${column} are less than ${colData["25%"]}.`,
        `75% of the values in ${column} are less than ${colData["75%"]}.`
      );
    }

    // CATEGORICAL COLUMN
    else {
      statements.push(
        `${column} has ${colData.count} total records.`,
        `${column} contains ${colData.unique} unique categories.`,
        `The most frequent value in ${column} is "${colData.top}".`,
        `"${colData.top}" appears ${colData.freq} times in ${column}.`
      );
    }
  });

  return statements;
};




  return (
    <div className="container">
      <h1>Welcome</h1>

      <input type="file" accept=".csv" onChange={handleUpload} />
      <br /><br />

      <button onClick={handleAnalyze}>
        Calculate Descriptive Analysis
      </button>

      <hr />

      {result && (
        <div className="result">
          <h2>Descriptive Analysis</h2>

          <table>
            <thead>
              <tr>
                <th>Statistic</th>
                {Object.keys(result).map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Object.keys(result[Object.keys(result)[0]]).map((stat) => (
                <tr key={stat}>
                  <td><b>{stat}</b></td>

                  {Object.keys(result).map((column) => (
                    <td key={column + stat}>
                      {result[column][stat] !== null &&
                      result[column][stat] !== undefined
                        ? result[column][stat]
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="insights">
          <h2>Data Insights</h2>
          <ul>
            {generateStatements().map((stmt, index) => (
              <li key={index}>{stmt}</li>
            ))}
          </ul>
        </div>
        <button onClick={handleDownloadPDF} style={{ marginTop: "20px" }}>
          Download Data Insights
        </button>
        </div>

      )}
    </div>
  );
}

export default App;