$(document).ready(() => {
  // Data for the chart (two values)
  const data = {
    labels: ['unused space', 'used space'],
    datasets: [{
      data: [40, 60], // Replace these numbers with your own data
      backgroundColor: [
        '#262626', // Color for Value 2
        'darkslategray', // Color for Value 1
      ],
      borderWidth: 1
    }]
  };

  // Configuration for the chart
  const config = {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      cutout: '75%', // Adjust the cutout to change the size of the center hole
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  };

  // Create the chart
  const myChart = new Chart(
    document.getElementById('myDonutChart'),
    config
  );
});