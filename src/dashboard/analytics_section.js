document.addEventListener("DOMContentLoaded", async () => {
  //Update graph in analytics section
  await updateGraph();
});

async function updateGraph() {
  const { found_cookies } = await chrome.storage.local.get("found_cookies");
  const keys = Object.keys(found_cookies);

  let xValues = [];
  let yValues = [];

  for (let i = 0; i < 10 && i < keys.length; i++) {
    const date = new Date(keys[i]);
    console.log("Getting cookies for " + date);
    const date_string = date.getMonth() + 1 + "/" + date.getDate();

    xValues.push(date_string);
    yValues.push(found_cookies[keys[i]].length);
  }

  const chart = document.getElementById("insecure_cookies_chart");
  const insecure_cookies_chart = new Chart(chart, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: "rgba(0,0,255,1.0)",
          borderColor: "rgbs(0,0,255,1.0)",
          data: yValues,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Insecure Cookies over time",
          font: { size: 16 },
          color: "black",
        },
      },
      scales: {
        x: {
          ticks: {
            color: "black",
          },
          title: {
            display: true,
            text: "Date",
            color: "black",
          },
        },
        y: {
          ticks: {
            color: "black",
          },
          title: {
            display: true,
            text: "# of Cookies",
            color: "black",
          },
        },
      },
    },
  });
}