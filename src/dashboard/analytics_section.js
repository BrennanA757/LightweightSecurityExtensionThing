document.addEventListener("DOMContentLoaded", async () => {
  //Update graph in analytics section
  await updateGraph();
});

async function updateGraph() {
  let keys;
  const { found_cookies } = await chrome.storage.local.get("found_cookies");
  if (found_cookies != undefined) {
    keys = Object.keys(found_cookies);
  } else {
    keys = [];
  }

  let xValues = [];
  let yValues = [];

  //Get and sort found cookie data
  const dates = getSortedDatesList(keys);

  //Push data onto lists
  for (let i = 0; i < 10 && i < keys.length; i++) {
    const date = dates[i];
    const date_string = date.getMonth() + 1 + "/" + date.getDate();

    let date_length = 0;
    if (found_cookies[date.toDateString()] != undefined) {
      date_length = found_cookies[date.toDateString()].length;
    }

    xValues.push(date_string);
    yValues.push(date_length);
  }

  const chart = document.getElementById("insecure_cookies_chart");
  const insecure_cookies_chart = new Chart(chart, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: "rgba(255,0,0,1.0)",
          borderColor: "rgbs(255,0,0,1.0)",
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

function getSortedDatesList(keys) {
  let dates = [];
  let days = [];
  for (const key of keys) {
    const date = new Date(key);
    dates.push(date);
    days.push(date.getDate());
  }

  const list_length = days.length;
  for (let i = 0; i < list_length - 1; i++) {
    let swap_index = i;
    for (let j = i + 1; j < list_length; j++) {
      //Loop though other days. If found day smaller than days[swap_index], swap dates.
      if (days[j] < days[swap_index]) {
        swap_index = j;
      }
    }

    //If found date smaller than smallest, swap
    if (swap_index != i) {
      const temp_day = days[i];
      const temp_date = dates[i];
      days[i] = days[swap_index];
      dates[i] = dates[swap_index];
      days[swap_index] = temp_day;
      dates[swap_index] = temp_date;
    }
  }

  return dates;
}
