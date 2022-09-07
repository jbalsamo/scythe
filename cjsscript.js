function fetchPokemon(name) {
    return new Promise((resolve, reject) => {
      fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then((res) => {
        if (res.status === 200) {
          resolve(res.json());
        } else if (res.status === 404) {
          return reject({
            status: 404,
            message: "No pokemon named" + name + " is found.",
          });
        } else {
          reject({
            status: res.status,
            message: "Something went wrong...",
          });
        }
      });
    });
}

function loadBarChart(data) {
    //1.
    let barChart = document.getElementById("bar-chart");
    //2.
    const { base_experience, height, weight } = data;
    //3.
    barChart = new Chart(barChart, {
      type: "bar",
      data: {
        datasets: [
          {
            data: [base_experience],
            label: "Base Experience",
            backgroundColor: "rgba(197,48,48,0.5)", //red
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            data: [height],
            label: "Height",
            backgroundColor: "rgba(75, 192, 192, 0.5)", //green
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            data: [weight],
            label: "Weight",
            backgroundColor: "rgba(255, 159, 64, 0.5)", //yellow
            borderColor: "rgba(255, 159, 64, 1)",
            borderWidth: 1,
          },
        ],
      }
  });
}

function loadPieChart(femalePercent) {
    //1.
    let pieChart = document.getElementById("pie-chart");
    //2.
    pieChart = new Chart(pieChart, {
      type: "pie",
      data: {
        datasets: [
          //only 1 data obj in datasets
          {
            data: [femalePercent, 100 - femalePercent], // female, male
            backgroundColor: [
              "rgba(255,137,180, 0.5)", //pink for female
              "rgba(44, 130, 201, 0.5)", //blue for male
            ],
            borderColor: ["rgba(255,137,180,1 )", "rgba(44, 130, 201,1)"],
            borderWidth: 1, //they share the same value so no need array
          },
        ],
        //add custom labels, female first then male
        labels: ["Female", "Male"],
      },
    });
}

function loadRadarChart(data) {
    //1.
    let statsChart = document.getElementById("radar-chart");
    //2.
    statsChart = new Chart(statsChart, {
      type: "radar",
      data: {
        //Will show up on each radar points in clockwise order
        labels: ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"],
        datasets: [
          {
            //one data obj per set, order same as labels
            data: [
              data[0]["base_stat"], //HP
              data[1]["base_stat"], //Atk
              data[2]["base_stat"], //Def
              data[3]["base_stat"], //SpA
              data[4]["base_stat"], //SpD
              data[5]["base_stat"], //Speed
            ],
            backgroundColor: "rgba(197,48,48,0.5)", // red
          },
          /*Add another set if needed like so
          {
             data: [ ]
          },
          */
        ],
      },
    });
  }
  