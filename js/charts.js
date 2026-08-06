/**
 * Chart.js Manager for Analytics Page
 * Visualizes candidate performance trends, skill distributions, and frequency
 */

let trendChartInstance = null;
let skillChartInstance = null;

export function renderAnalyticsCharts(interviews = []) {
  const trendCanvas = document.getElementById("trendChart");
  const skillCanvas = document.getElementById("skillChart");

  if (!trendCanvas || !skillCanvas) return;

  // Destroy existing charts if reloading
  if (trendChartInstance) trendChartInstance.destroy();
  if (skillChartInstance) skillChartInstance.destroy();

  // Sort chronological (oldest to newest for line chart)
  const sortedHistory = [...interviews].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  // Prepare Trend Data
  const labels = sortedHistory.length 
    ? sortedHistory.map((item, idx) => {
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Session ${idx + 1}`;
        return date;
      })
    : ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];

  const scores = sortedHistory.length
    ? sortedHistory.map(item => item.aiFeedback?.overall_score || 0)
    : [65, 72, 78, 85, 90];

  // 1. Line Chart: Progress Trends over time
  trendChartInstance = new Chart(trendCanvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Overall Score',
        data: scores,
        borderColor: '#6366f1',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });

  // Calculate Aggregate Sub-Scores for Skill Breakdown
  let avgGrammar = 85;
  let avgTech = 80;
  let avgComm = 88;
  let avgConf = 82;

  if (sortedHistory.length > 0) {
    let sumGrammar = 0, sumTech = 0, sumComm = 0, sumConf = 0;
    sortedHistory.forEach(item => {
      const fb = item.aiFeedback || {};
      sumGrammar += fb.grammar_score || 0;
      sumTech += fb.technical_accuracy || 0;
      sumComm += fb.communication_score || 0;
      sumConf += fb.confidence_score || 0;
    });
    const len = sortedHistory.length;
    avgGrammar = Math.round(sumGrammar / len);
    avgTech = Math.round(sumTech / len);
    avgComm = Math.round(sumComm / len);
    avgConf = Math.round(sumConf / len);
  }

  // 2. Bar Chart: Skill Distribution
  skillChartInstance = new Chart(skillCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Technical Accuracy', 'Communication', 'Grammar', 'Confidence'],
      datasets: [{
        label: 'Skill Score',
        data: [avgTech, avgComm, avgGrammar, avgConf],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          '#6366f1',
          '#8b5cf6',
          '#06b6d4',
          '#f59e0b'
        ],
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}
