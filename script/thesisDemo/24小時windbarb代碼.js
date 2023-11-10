if(varName=="WSPD_10")
{
  for (var i=0; i<25; i++)
  {
    try {
      var yy=0.539956803*YHour[i];
      // 畫風標的函數
      var a=WindBarbArrowHandler.WindArrow(yy,DirHour[i],$("#windBarbArrow"), 24,x(minX)+width/25*i,y(0)-40);
      svg
          .append("path")
          // .data([data])
          .attr("class", a["class"])
          .attr("d", a["d"])
          .attr("x", x(minX)+width/25*i)
          .attr("y",y(breakY))
          
          .attr("transform",a["transform"])
          .style("fill","yellow")
          .attr('stroke', 'yellow')
          .attr('stroke-width', '0.7');
      }
      catch(error)
      {
        console.error(error);
      }
    }
}