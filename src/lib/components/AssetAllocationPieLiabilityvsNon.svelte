<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  // assets: array of { id, name, category_id, value, ... }
  export let assets: any[] = [];
  // assetCategories: array of { id, name, color?, is_liability? }
  export let assetCategories: any[] = [];

  let pieCanvas: HTMLCanvasElement | null = null;
  let allocationChart: Chart | undefined;

  // map for fast lookup
  $: categoryMap = Array.isArray(assetCategories)
    ? Object.fromEntries(
        assetCategories
          .filter(c => c && typeof c.id !== "undefined")
          .map(category => [category.id, category])
      )
    : {};

  // Palette: pick two distinct colors for liability and non-liability
  const palette = ['#ef4444', '#2563eb'];

  // Only show data is_liability = true vs is_liability = false
  function getPieData() {
    let liabilitySum = 0;
    let nonLiabilitySum = 0;

    if (Array.isArray(assets) && Array.isArray(assetCategories)) {
      for (const asset of assets) {
        if (!asset || typeof asset.category_id === "undefined") continue;
        const category = categoryMap[asset.category_id];
        if (!category) continue;

        let val = 0;
        if (typeof asset.total_value === 'string') {
          val = parseFloat(asset.total_value.replace(/,/g, '')) || 0;
        } else if (typeof asset.total_value === 'number') {
          val = asset.total_value || 0;
        } else if (asset.value !== undefined) {
          if (typeof asset.value === 'string') {
            val = parseFloat(asset.value.replace(/,/g, '')) || 0;
          } else if (typeof asset.value === 'number') {
            val = asset.value || 0;
          }
        }
        if (isNaN(val) || !isFinite(val)) continue;
        if (category.is_liability === true) {
          liabilitySum += val;
        } else {
          nonLiabilitySum += val;
        }
      }
    }

    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];

    if (nonLiabilitySum > 0) {
      labels.push("Non-Liability");
      data.push(nonLiabilitySum);
      backgroundColor.push(palette[1]);
    }
    if (liabilitySum > 0) {
      labels.push("Liability");
      data.push(liabilitySum);
      backgroundColor.push(palette[0]);
    }

    return { labels, data, backgroundColor };
  }

  function renderPie() {
    if (!pieCanvas || !Array.isArray(assetCategories) || assetCategories.length === 0) {
      allocationChart?.destroy();
      return;
    }
    const { labels, data, backgroundColor } = getPieData();

    if (!labels.length || !data.length) {
      allocationChart?.destroy();
      return;
    }

    // Percentages shown in labels
    const total = data.reduce((a, b) => a + b, 0);
    const labelsWithPercent = labels.map((name, idx) => {
      const value = data[idx];
      const percent = total > 0 ? (value / total * 100).toFixed(2) : "0.00";
      return `${name} (${percent}%)`;
    });

    if (allocationChart) {
      allocationChart.destroy();
    }
    allocationChart = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: labelsWithPercent,
        datasets: [
          {
            data,
            backgroundColor,
            borderWidth: 1,
            borderColor: "#fff",
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              font: { size: 14 }
            }
          },
          title: {
            display: true,
            text: 'Assets: Liability vs Non-Liability',
            font: { size: 18 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const labelWithPercent = context.label || '';
                const value = context.parsed || 0;
                const datasetData = Array.isArray(context.dataset.data)
                  ? context.dataset.data
                  : [];
                const total = datasetData.reduce((a: number, b: number) => a + b, 0);
                const percent = total > 0 ? (value / total * 100).toFixed(2) : "0.00";
                let simpleLabel = labelWithPercent.replace(/\s*\([\d.]+%?\)\s*$/, '');
                return `${simpleLabel}: ${value.toLocaleString('id-ID')} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }

  onMount(() => {
    renderPie();
  });

  $: {
    renderPie();
  }

  onDestroy(() => {
    allocationChart?.destroy();
  });
</script>

{#if Array.isArray(assets) && assets.length > 0 && Array.isArray(assetCategories) && assetCategories.length > 0}
  <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 1rem;">
    <canvas bind:this={pieCanvas} style="width:100%;"></canvas>
  </div>
{:else}
  <div style="text-align:center; padding: 2rem;">
    <p>No assets available for allocation chart.</p>
  </div>
{/if}
