for (var j=0;j<colorLevel.length-1;j++)
{
  var area = d3
  .area()
  .x((d) => { return x(d["OBS_DATETIME"]); })
  .y0(height)
  .y1((d) => { 
    if (d[varName]>= colorLevel[j][0]&& d[varName]< colorLevel[j+1][0])
    { 
      return y(d["min"]);
    }
    else return y(0)
  })
  areaAry.push(area);   
}
for (var j=0;j<colorLevel.length-1;j++)
{
    var red=colorLevel[j][1][0];
    var green=colorLevel[j][1][1];
    var blue=colorLevel[j][1][2];
    var opacityColor=colorLevel[j][1][3];
    var color = asColorStyle(red,green,blue, opacityColor);
    svg
    .append("path")
    .data([data])
    .attr("class", "area")
    .attr("d", areaAry[j])
    .attr("transform", "translate(0,300)")
    .transition()
    .duration(1000)
    .attr("transform", "translate(0,0)")
    .attr("fill", color);
}