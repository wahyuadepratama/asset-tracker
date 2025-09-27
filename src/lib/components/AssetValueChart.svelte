<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  // assetHistory bisa berisi total_unit_assets dalam bentuk string (misal: "2.5M", "1.2K") atau number
  export let assetHistory: { date: string; total_unit_assets: number }[] = [];

  let canvasElValue: HTMLCanvasElement | null = null;
  let chartAssetValue: Chart | undefined;

  // Format data bulanan dan cari min/max untuk sumbu Y
  function formatChartData() {
    const monthlyData: { [month: string]: number } = {};

    assetHistory.forEach(item => {
      const month = new Date(item.date).toISOString().slice(0, 7); // format: YYYY-MM
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += item.total_unit_assets;
      if (monthlyData[month] < 0) monthlyData[month] = monthlyData[month] * -1;
    });

    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(month => monthlyData[month]);

    // Jika data kosong, set min dan max ke 0 supaya tidak error
    let min = data.length > 0 ? Math.min(...data) : 0;
    let max = data.length > 0 ? Math.max(...data) : 0;

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

    return n.toLocaleString('id-ID');
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

  function renderChartValue() {
    // Jangan render chart jika canvas belum siap
    if (!canvasElValue) return;

    const { labels, data, minY, maxY } = formatChartData();

    // Jika tidak ada data, jangan render chart
    if (labels.length === 0 || data.length === 0) {
      if (chartAssetValue) {
        chartAssetValue.destroy();
        chartAssetValue = undefined;
      }
      return;
    }

    if (chartAssetValue) {
      chartAssetValue.destroy();
    }

    chartAssetValue = new Chart(canvasElValue, {
      type: 'line',
      data: {
        labels: labels.map(formatMonthLabel),
        datasets: [{
          label: 'Total Items',
          data,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          fill: true,
          tension: 0.5,
          pointRadius: 7,
          pointBackgroundColor: '#ef4444',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Total in Value or Items',
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
    renderChartValue();
  });

  // Update chart jika assetHistory berubah
  $: assetHistory, renderChartValue();

  onDestroy(() => {
    chartAssetValue?.destroy();
  });
</script>

<div style="width: 100%; height: 320px;">
  <canvas bind:this={canvasElValue} style="max-width: 100%; height: 100%;"></canvas>
</div>
