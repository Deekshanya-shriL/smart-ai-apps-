// ============================================================
// SMART FOOD SPOILAGE PREDICTOR
// REAL-TIME DASHBOARD JAVASCRIPT
// ============================================================

let temperatureData = [];
let humidityData = [];
let freshnessData = [];
let timeLabels = [];

let sensorChart = null;


// ============================================================
// GET HTML ELEMENTS
// ============================================================

const temperatureElement =
    document.getElementById("temperature");

const humidityElement =
    document.getElementById("humidity");

const storageElement =
    document.getElementById("storageDays");

const timestampElement =
    document.getElementById("timestamp");

const riskElement =
    document.getElementById("risk");

const statusElement =
    document.getElementById("status");

const confidenceElement =
    document.getElementById("confidence");

const recommendationElement =
    document.getElementById("recommendation");

const freshnessElement =
    document.getElementById("freshness");

const freshnessBar =
    document.getElementById("freshnessBar");

const connectionStatus =
    document.getElementById("connectionStatus");

const systemStatus =
    document.getElementById("systemStatus");


// ============================================================
// GET AI PREDICTION
// ============================================================

async function updateDashboard() {

    try {

        const response =
            await fetch("/api/predict");

        if (!response.ok) {

            throw new Error(
                "Server returned an error"
            );

        }

        const data =
            await response.json();


        // ====================================================
        // UPDATE SENSOR VALUES
        // ====================================================

        temperatureElement.textContent =
            data.temperature;

        humidityElement.textContent =
            data.humidity;

        storageElement.textContent =
            data.storage_days;


        // ====================================================
        // UPDATE TIMESTAMP
        // ====================================================

        const currentTime =
            new Date().toLocaleTimeString();

        timestampElement.textContent =
            currentTime;


        // ====================================================
        // UPDATE SPOILAGE RISK
        // ====================================================

        const risk =
            String(data.spoilage_risk).toUpperCase();

        riskElement.textContent =
            risk;


        // Remove previous risk classes

        riskElement.classList.remove(
            "risk-low",
            "risk-medium",
            "risk-high"
        );


        // Apply risk color

        if (risk === "LOW") {

            riskElement.classList.add(
                "risk-low"
            );

            statusElement.textContent =
                "Food condition is currently stable.";

            recommendationElement.innerHTML =
                " <strong>Recommendation:</strong> " +
                "Food appears relatively fresh. " +
                "Continue monitoring temperature and humidity.";

        }

        else if (risk === "MEDIUM") {

            riskElement.classList.add(
                "risk-medium"
            );

            statusElement.textContent =
                "Moderate spoilage risk detected.";

            recommendationElement.innerHTML =
                " <strong>Recommendation:</strong> " +
                "Monitor storage conditions closely " +
                "and consider consuming the food soon.";

        }

        else {

            riskElement.classList.add(
                "risk-high"
            );

            statusElement.textContent =
                "High spoilage risk detected!";

            recommendationElement.innerHTML =
                " <strong>Recommendation:</strong> " +
                "Spoilage risk is high. Check the food " +
                "quality before consumption.";

        }


        // ====================================================
        // UPDATE AI CONFIDENCE
        // ====================================================

        confidenceElement.textContent =
            data.confidence + "%";


        // ====================================================
        // UPDATE FRESHNESS SCORE
        // ====================================================

        const freshness =
            Number(data.freshness_score);


        freshnessElement.textContent =
            freshness.toFixed(1);


        freshnessBar.style.width =
            freshness + "%";


        // ====================================================
        // UPDATE SYSTEM STATUS
        // ====================================================

        connectionStatus.textContent =
            "LIVE";

        systemStatus.textContent =
            "Online";


        // ====================================================
        // UPDATE REAL-TIME CHART DATA
        // ====================================================

        timeLabels.push(
            currentTime
        );

        temperatureData.push(
            data.temperature
        );

        humidityData.push(
            data.humidity
        );

        freshnessData.push(
            freshness
        );


        // Keep only latest 15 readings

        if (timeLabels.length > 15) {

            timeLabels.shift();
            temperatureData.shift();
            humidityData.shift();
            freshnessData.shift();

        }


        updateChart();


        console.log(
            "Real-time AI data:",
            data
        );

    }

    catch (error) {

        console.error(
            "Dashboard connection error:",
            error
        );


        // ====================================================
        // CONNECTION ERROR
        // ====================================================

        connectionStatus.textContent =
            "OFFLINE";

        systemStatus.textContent =
            "Disconnected";

        statusElement.textContent =
            "Unable to receive sensor data.";

    }

}


// ============================================================
// CREATE CHART
// ============================================================

function createChart() {

    const canvas =
        document.getElementById(
            "sensorChart"
        );


    if (!canvas) {

        console.error(
            "sensorChart canvas not found."
        );

        return;

    }


    const ctx =
        canvas.getContext("2d");


    sensorChart =
        new Chart(
            ctx,
            {

                type: "line",

                data: {

                    labels:
                        timeLabels,

                    datasets: [

                        {

                            label:
                                "Temperature (°C)",

                            data:
                                temperatureData,

                            borderWidth: 2,

                            tension: 0.3,

                            fill: false

                        },

                        {

                            label:
                                "Humidity (%)",

                            data:
                                humidityData,

                            borderWidth: 2,

                            tension: 0.3,

                            fill: false

                        },

                        {

                            label:
                                "Freshness (%)",

                            data:
                                freshnessData,

                            borderWidth: 2,

                            tension: 0.3,

                            fill: false

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    animation: false,

                    interaction: {

                        mode: "index",

                        intersect: false

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            max: 100

                        }

                    },

                    plugins: {

                        legend: {

                            display: true

                        }

                    }

                }

            }

        );

}


// ============================================================
// UPDATE CHART
// ============================================================

function updateChart() {

    if (!sensorChart) {

        return;

    }


    sensorChart.data.labels =
        timeLabels;


    sensorChart.data.datasets[0].data =
        temperatureData;


    sensorChart.data.datasets[1].data =
        humidityData;


    sensorChart.data.datasets[2].data =
        freshnessData;


    sensorChart.update();

}


// ============================================================
// START DASHBOARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Smart Food Spoilage Predictor started."
        );


        createChart();


        // First prediction

        updateDashboard();


        // Update every 2 seconds

        setInterval(
            updateDashboard,
            2000
        );

    }
);