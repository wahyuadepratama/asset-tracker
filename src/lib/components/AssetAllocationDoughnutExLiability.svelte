<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  // assets: array of { id, name, category_id, value, ... }
  export let assets: any[] = [];
  // assetCategories: array of { id, name, color?, is_liability? }
  export let assetCategories: any[] = [];

  let pieCanvas: HTMLCanvasElement | null = null;
  let allocationChart: Chart | undefined;

  // Defensive: Only build map if array is valid
  $: categoryMap = Array.isArray(assetCategories)
    ? Object.fromEntries(
        assetCategories
          .filter(c => c && typeof c.id !== "undefined")
          .map(category => [category.id, category])
      )
    : {};

  // Prepare doughnut chart data by looping assetCategories and summing asset.total_value
  // Exclude categories where is_liability === true
  function getPieData() {
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];

    if (!Array.isArray(assetCategories)) return { labels, data, backgroundColor };

    // Only process categories where is_liability != true
    const filteredCategories = assetCategories.filter(
      category =>
        category &&
        typeof category.id !== "undefined" &&
        typeof category.name !== "undefined" &&
        category.is_liability !== true
    );

    filteredCategories.forEach((category, idx) => {
      // Get all assets in this category
      const assetsInCategory = Array.isArray(assets)
        ? assets.filter(
            asset =>
              asset &&
              typeof asset.category_id !== "undefined" &&
              asset.category_id === category.id
          )
        : [];
      // Calculate total_value for this category
      let totalValue = 0;
      for (const asset of assetsInCategory) {
        if (!asset) continue;
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
        if (!isNaN(val)) totalValue += val;
      }
      if (totalValue > 0) {
        labels.push(category.name);
        backgroundColor.push(category.color || palette[idx % palette.length]);
        data.push(totalValue);
      }
    });

    return { labels, data, backgroundColor };
  }

  // Simple color palette if category color missing
  const palette = [
    '#2563eb', '#f59e42', '#e5322d', '#48b774', '#8b5cf6', '#eab308', '#ef4444', '#06b6d4',
    '#7c3aed', '#fde047', '#f472b6', '#10b981', '#57534e'
  ];

  function renderPie() {
    // Avoid chart rendering if we don't have canvas or categories
    if (!pieCanvas || !Array.isArray(assetCategories) || assetCategories.length === 0) {
      allocationChart?.destroy();
      return;
    }

    const { labels, data, backgroundColor } = getPieData();

    // Don't render if empty
    if (!labels.length || !data.length) {
      allocationChart?.destroy();
      return;
    }

    // Prepare percent for each label, and create new labels including percent
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
      type: 'doughnut',
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
        cutout: '60%', // Make it clearly a doughnut chart
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
            text: 'Asset Allocation by Category (Excluding Liability)',
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
