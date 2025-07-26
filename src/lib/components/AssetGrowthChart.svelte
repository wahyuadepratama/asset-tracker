<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  export let assetHistory: { date: string; total_assets: number }[] = [];

  let canvasEl: HTMLCanvasElement;
  let chart: Chart | undefined;

  // Persiapkan data bulanan
  const formatChartData = () => {
    const monthlyData: { [month: string]: number } = {};

    // Kelompokkan total asset per bulan
    assetHistory.forEach(item => {
      const month = new Date(item.date).toISOString().slice(0, 7); // format: YYYY-MM
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += item.total_assets;
    });

    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(month => monthlyData[month]);

    return { labels, data };
  };

  onMount(() => {
    const { labels, data } = formatChartData();

    chart = new Chart(canvasEl, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total Aset Bulanan',
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: {
            display: true,
            text: 'Pertumbuhan Aset per Bulan'
          }
        },
        scales: {
          y: {
            ticks: { callback: val => `Rp ${val.toLocaleString('id-ID')}` }
          }
        }
      }
    });
  });

  // Optional: Cleanup
  onDestroy(() => {
    chart?.destroy();
  });
</script>

<canvas bind:this={canvasEl} style="max-width: 100%; height: 300px;"></canvas>
