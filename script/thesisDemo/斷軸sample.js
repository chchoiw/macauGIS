var minY=d3.min(data, (d) => { return d["min"]; });

var minDate=formatDate(d3.min(data, (d) => { return d["OBS_DATETIME"]; }));
var minX=d3.min(data, (d) => { return d["OBS_DATETIME"]; })
var step=1;
var breakY=minY/2;
if (varName=="WSPD_10") 
{
  step=2;
}
else if (varName=="TEMP") 
{ 
  step=1;
}
else if (varName=="HUMI")
{
  step=5;
}
else if (varName=="wl")
{
  step=0.1;
}
if (minY<=(maxY-minY)/5 ) breakAxisY=false;
else breakAxisY=true;
var y;
if (breakAxisY)
{
  y = d3.scaleLinear().range([height,
  (height*4/5 +20),
    margin.bottom]);
}
else
{
    y = d3.scaleLinear().range([height,
    margin.bottom]);    
}
if (breakAxisY)
{
  y.domain([0,minY,maxY])
  
  var rangeYAry=[0,breakY];
  for(let i = minY; i <= maxY; i += step){
    rangeYAry.push(i);
  }
}
else
{
  y.domain([0,maxY])  
  var rangeYAry=[];
  for(let i = 0; i <= maxY; i += step){
    rangeYAry.push(i);
  }
        
};
if (breakAxisY)
{
svg.append("rect")
  .attr("x", margin.left - 60)
  .attr("y", y((minY-breakY)/2+(minY-breakY)/10))
  .attr("height", 10)
  .attr("width", 20)
  .style("fill", "white");
svg.append("rect")
  .attr("x", margin.left - 60)
  .attr("y", y( (minY-breakY)/2+(minY-breakY)/13))
  .attr("height", 7)
  .attr("width", 20)
  .style("fill", "#000"); 
}