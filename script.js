const chart = document.querySelector('#incident-chart');
const grid = document.querySelector('#grid-lines');
const xAxis = document.querySelector('#x-axis');
const areaPath = document.querySelector('#area-path');
const linePath = document.querySelector('#line-path');
const select = document.querySelector('#time-range');

const width = 560;
const height = 200;
const padding = { top: 12, right: 8, bottom: 34, left: 8 };

function generateChartData(days, maxVal = 50) {
  const today = new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    const wave = Math.sin(index * 0.75) * 12;
    const noise = Math.cos(index * 1.7) * 7;
    return { date, value: Math.max(10, Math.round(maxVal / 2 + wave + noise + 12)) };
  });
}

function pointList(data) {
  const max = Math.max(...data.map(item => item.value));
  const min = Math.min(...data.map(item => item.value));
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  return data.map((item, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
    const y = padding.top + (1 - (item.value - min) / Math.max(max - min, 1)) * innerHeight;
    return { ...item, x, y };
  });
}

function lineCommand(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function renderChart(days = 7) {
  const points = pointList(generateChartData(days));
  const baseline = height - padding.bottom;
  linePath.setAttribute('d', lineCommand(points));
  areaPath.setAttribute('d', `${lineCommand(points)} L ${points.at(-1).x.toFixed(2)} ${baseline} L ${points[0].x.toFixed(2)} ${baseline} Z`);

  grid.replaceChildren();
  xAxis.replaceChildren();
  for (let i = 0; i < 5; i++) {
    const y = padding.top + i * ((baseline - padding.top) / 4);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'grid-line');
    line.setAttribute('x1', padding.left);
    line.setAttribute('x2', width - padding.right);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    grid.append(line);
  }

  const labelCount = days === 7 ? 7 : 6;
  for (let i = 0; i < labelCount; i++) {
    const point = points[Math.round(i * (points.length - 1) / (labelCount - 1))];
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('class', 'axis-label');
    label.setAttribute('x', point.x);
    label.setAttribute('y', height - 8);
    label.setAttribute('text-anchor', i === 0 ? 'start' : i === labelCount - 1 ? 'end' : 'middle');
    label.textContent = `${point.date.getMonth() + 1}/${point.date.getDate()}`;
    xAxis.append(label);
  }
}

select.addEventListener('change', event => renderChart(Number(event.target.value)));
renderChart(Number(select.value));
