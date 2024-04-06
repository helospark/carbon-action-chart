
function createBubbleChart(idParam, bubbleDataParam, chartConfigParam) {
    const id = idParam;
    const bubbleData = bubbleDataParam;
    const chartElement = document.getElementById(id);
    const popup = document.getElementById("popupDiv");
    const chartConfig = chartConfigParam;
    const leftAxisWidth = 30;
    const bottomAxisWidth = 15;
    
    chartElement.addEventListener("mousemove", e => handleHover(e, bubbleData)); 
    window.addEventListener("resize", () => drawBubbleChart(id, bubbleData)); 
    
    drawBubbleChart(id, bubbleData);
    
    function mapToPixel(point) {
        const canvasX = chartElement.getBoundingClientRect().left + leftAxisWidth;
        const canvasY = chartElement.getBoundingClientRect().top;
        const canvasW = chartElement.getBoundingClientRect().width - leftAxisWidth;
        const canvasH = chartElement.getBoundingClientRect().height - bottomAxisWidth;
        
        const dataWidth = chartConfig.maxX - chartConfig.minX;
        const dataHeight = chartConfig.maxY - chartConfig.minY;
        
        var pointY = point.y;
        if (chartConfig.invertYAxis) {
          pointY = dataHeight - pointY;
        }
        
        const resultX = ((point.x - chartConfig.minX) / dataWidth) * (canvasW) + leftAxisWidth;
        const resultY = ((pointY - chartConfig.minY) / dataHeight) * (canvasH);
    
        return {x: resultX, y: resultY};
    }
    /*
    function mapToData(point) {
        const canvasX = chartElement.getBoundingClientRect().left + leftAxisWidth;
        const canvasY = chartElement.getBoundingClientRect().top;
        const canvasW = chartElement.getBoundingClientRect().width - leftAxisWidth;
        const canvasH = chartElement.getBoundingClientRect().height - bottomAxisWidth;
        
        const dataWidth = chartConfig.maxX - chartConfig.minX;
        const dataHeight = chartConfig.maxY - chartConfig.minY;
        
        const resultX = ((point.x / canvasW) * (dataWidth)) + chartConfig.minX;
        const resultY = ((point.y / canvasH) * (dataHeight)) + chartConfig.minY;
    
        return {x: resultX, y: resultY};
    }*/

    function drawCircle(x, y, size, color, ctx) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    function mapRadiusToPixel(point) {
        return point / chartConfig.abScaler;
    }

    function drawBubble(point, ctx) {
        const scaler = 100;
        const radiusA = mapRadiusToPixel(point.a);
        const radiusB = mapRadiusToPixel(point.b);
        
        const mPoint = mapToPixel(point);

        if (radiusA < radiusB) {
            drawCircle(mPoint.x, mPoint.y, radiusB, "rgba(255, 0, 0, 0.9)", ctx);
            drawCircle(mPoint.x, mPoint.y, radiusA, "rgba(0, 255, 0, 0.9)", ctx);
        } else {
            drawCircle(mPoint.x, mPoint.y, radiusA, "rgba(0, 255, 0, 0.9)", ctx);
            drawCircle(mPoint.x, mPoint.y, radiusB, "rgba(255, 0, 0, 0.9)", ctx);
        }
    }

    function isPointInCircle(center, radius, point) {
      // Calculate distance between center and point
      const distanceSquared = Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2);

      // Compare distance to radius squared (avoid square root for efficiency)
      return distanceSquared <= radius * radius;
    }

    function handleHover(e, data) {
      let absX = e.pageX;
      let absY = e.pageY;
      
      const rect = chartElement.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      
      var found = false;
      for (const element of data) {
         var maxRadius = Math.max(mapRadiusToPixel(element.a) , mapRadiusToPixel(element.b) );
         
         if (isPointInCircle(mapToPixel(element), maxRadius, {x: x, y: y})) {
              popup.style.left = absX - (popup.clientWidth / 2.0);
              popup.style.top = absY + 30;
              found = true;
              break;
          }
      }
      
      if (!found) {
        popup.style.display = "none";
      } else {
        popup.style.display = "block";
      }

    }
    
    function drawCenteredText(ctx, text, x, y) {

      const textWidth = ctx.measureText(text).width;
      const centeredX = x - textWidth / 2;
      ctx.fillText(text, centeredX, y);
    }

    
    function drawGrid(canvas, ctx) {
        const gridXSize = (chartConfig.maxX - chartConfig.minX) / chartConfig.gridXCount;
        const gridYSize = (chartConfig.maxY - chartConfig.minY) / chartConfig.gridYCount;
        
        ctx.strokeStyle = "lightgray";
        ctx.lineWidth = 1;
        ctx.font = "12px serif";
        
        for (var i = 0; i <= chartConfig.gridXCount; ++i) {
            const value = Math.round(i * gridXSize);
            const mappedX = mapToPixel({x: value, y:0}).x;
            ctx.beginPath();
            ctx.moveTo(mappedX, 0);
            ctx.lineTo(mappedX, canvas.height - bottomAxisWidth);
            ctx.stroke();
            drawCenteredText(ctx, "" + value, mappedX, canvas.height)
        }
        
        for (var i = 0; i <= chartConfig.gridYCount; ++i) {
            const value = Math.round(i * gridYSize);
            const mappedY = mapToPixel({x:0, y:value}).y;
            ctx.beginPath();
            ctx.moveTo(leftAxisWidth, mappedY);
            ctx.lineTo(canvas.width, mappedY);
            ctx.stroke();
            
            ctx.fillText("" + value, 0, mappedY)
        }
    }

    function drawBubbleChart(canvasId, data) {
        const canvas = chartElement;
        canvas.width = chartElement.getBoundingClientRect().width;
        canvas.height = chartElement.getBoundingClientRect().height;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawGrid(canvas, ctx);
        
        data.forEach(d => drawBubble(d, ctx));
    }
}

// Sample data
const bubbleData = [
  { x: 1, y: 1, a: 30, b: 40 },
  { x: 10, y: 50, a: 30, b: 40 },
  { x: 20, y: 100, a: 50, b: 100 },
  { x: 40, y: 75, a: 20, b: 4 },
  { x: 80, y: 75, a: 20, b: 4 },
];

const chartConfig = {
  minX: 0,
  maxX: 100,
  minY: 0,
  maxY: 200,
  abScaler: 5,
  gridXCount: 15,
  gridYCount: 10,
  invertYAxis: true
}

createBubbleChart("main-chart", bubbleData, chartConfig);

