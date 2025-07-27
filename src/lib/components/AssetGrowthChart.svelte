<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  // assetHistory bisa berisi total_assets dalam bentuk string (misal: "2.5M", "1.2K") atau number
  export let assetHistory: { date: string; total_assets: number | string }[] = [];

  let canvasEl: HTMLCanvasElement;
  let chart: Chart | undefined;

  // Fungsi untuk mengubah string "2.5M" atau "1.2K" ke number
  function parseAssetValue(val: string | number): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      if (val.endsWith('M')) {
        return parseFloat(val) * 1_000_000;
      }
      if (val.endsWith('K')) {
        return parseFloat(val) * 1_000;
      }
      return parseFloat(val);
    }
    return 0;
  }

  // Format data bulanan dan cari min/max untuk sumbu Y
  function formatChartData() {
    const monthlyData: { [month: string]: number } = {};

    assetHistory.forEach(item => {
      const month = new Date(item.date).toISOString().slice(0, 7); // format: YYYY-MM
      if (!monthlyData[month]) monthlyData[month] = 0;
      let value = parseAssetValue(item.total_assets);
      if (value < 0) value = value * -1;
      monthlyData[month] += value;
    });

    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(month => monthlyData[month]);

    // Cari min dan max value dari data
    let min = Math.min(...data);
    let max = Math.max(...data);

    // Untuk sumbu Y, gunakan range hanya dari min ke max (tidak terlalu jauh)
    // Jika min == max, supaya chart tetap terlihat, buat min sedikit lebih kecil
    if (min === max) {
      min = min * 0.95;
      max = max * 1.05;
    }

    return { labels, data, minY: min, maxY: max };
  }

  function formatValue(num: number | string): string {
    // Jika input string seperti "7.31K", "0.02M", dst, parse dulu ke number
    let n: number;
    if (typeof num === 'string') {
      const match = num.match(/^([\d.,]+)\s*([KMB])?$/i);
      if (match) {
        let value = parseFloat(match[1].replace(',', '.'));
        const suffix = match[2]?.toUpperCase();
        if (suffix === 'B') value *= 1_000_000_000;
        else if (suffix === 'M') value *= 1_000_000;
        else if (suffix === 'K') value *= 1_000;
        n = value;
      } else {
        n = parseFloat(num.replace(',', '.'));
      }
    } else {
      n = num;
    }

    // Format ke "1M", "500K", dst tanpa Rupiah dan tanpa angka di belakang koma
    if (n >= 1_000_000_000) {
      return (n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 2).replace(/\.00$/, '') + 'B';
    } else if (n >= 1_000_000) {
      return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/\.00$/, '') + 'M';
    } else if (n >= 1_000) {
      return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 2).replace(/\.00$/, '') + 'K';
    } else {
      return n.toLocaleString('id-ID');
    }
  }

  function formatMonthLabel(label: string): string {
    // label: "2024-03"
    const [year, month] = label.split('-');
    const bulan = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${bulan[parseInt(month, 10) - 1]} ${year}`;
  }

  function renderChart() {
    const { labels, data, minY, maxY } = formatChartData();

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(canvasEl, {
      type: 'line',
      data: {
        labels: labels.map(formatMonthLabel),
        datasets: [{
          label: 'Total Assets',
          data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(79, 140, 255, 0.15)',
          fill: true,
          tension: 0.5,
          pointRadius: 7,
          pointBackgroundColor: '#2563eb',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Asset Growth Chart',
            font: { size: 18 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return formatValue(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: maxY * 1.1,
            beginAtZero: true,
            grace: '2%',
            ticks: {
              callback: function(val: any) {
                return formatValue(val);
              },
              padding: 8
            }
          },
          x: {
            ticks: {
              padding: 8
            }
          }
        }
      }
    });
  }

  onMount(() => {
    renderChart();
  });

  // Update chart jika assetHistory berubah
  $: assetHistory, renderChart();

  onDestroy(() => {
    chart?.destroy();
  });
</script>

<div style="width: 100%; height: 320px;">
  <canvas bind:this={canvasEl} style="max-width: 100%; height: 100%;"></canvas>
</div>
