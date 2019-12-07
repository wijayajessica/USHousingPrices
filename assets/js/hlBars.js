HLBars=function(_parentElement,_data){
    this.parentElement=_parentElement;
    this.data=_data;

    this.initVis();
};

HLBars.prototype.initVis=function(){
    var vis=this;
    vis.maxRatio=0;
    vis.data.forEach(function(d){
        for(var e in d){
            d[e]=+d[e];
            if(e!='Year'&d[e]>vis.maxRatio){
                vis.maxRatio=d[e];
            };
        };
    });

    vis.margin={left:150,right:40,top:10,bottom:10};
    vis.width=$(vis.parentElement).width()-vis.margin.left-vis.margin.right;
    vis.height=600-vis.margin.top-vis.margin.bottom;
    vis.svg=d3.select(vis.parentElement)
        .append('svg')
        .attr('width',vis.width+vis.margin.left+vis.margin.right)
        .attr('height',vis.height+vis.margin.top+vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.x=d3.scaleLinear()
        .range([0,vis.width])
        .domain([0,vis.maxRatio]);
    vis.y=d3.scaleBand()
        .range([vis.height,0])
        .paddingInner(0.1);
    vis.yAxis=d3.axisLeft();

    $(document).ready(function(){
        $('input:radio[name=hlyear]').on('click',function(){
            var year=+$('input:radio[name=hlyear]:checked').val();
            vis.wrangleData(year);
        });
    });

    vis.wrangleData(2010);
};

HLBars.prototype.wrangleData=function(year){
    var vis=this;

    vis.displayData=[];
    vis.data.forEach(function(d){
        if(d.Year===year){
            for(var i in d){
                if(i!='Year'){
                    vis.displayData.push({state:i,value:d[i]});
                }
            }
        };
    });
    vis.displayData.sort(function(a,b){
        return a.value-b.value;
    });

    vis.updateVis();
};

HLBars.prototype.updateVis=function(year){
    var vis=this;

    vis.y
        .domain(vis.displayData.map(function(d){
            return d.state;
        }));
    vis.yAxis
        .scale(vis.y);

    vis.rect=vis.svg.selectAll('rect')
        .data(vis.displayData);
    vis.rect.exit()
        .remove();
    vis.rect_enter=vis.rect.enter()
        .append('rect')
        .attr('class','bar');
    vis.rect.merge(vis.rect_enter)
        .transition()
        .attr("x",0)
        .attr("y", function(d) { return vis.y(d.state); })
        .attr("width", function(d) { return vis.x(d.value); })
        .attr("height", vis.y.bandwidth());

    vis.y_group=vis.svg.selectAll('.y-axis')
        .data(vis.displayData);
    vis.y_group.exit()
        .remove;
    vis.y_group_enter=vis.y_group.enter()
        .append('g')
        .attr('class','axis y-axis');
    vis.y_group.merge(vis.y_group_enter)
        .transition()
        .call(vis.yAxis);

    vis.number=vis.svg.selectAll('.number')
        .data(vis.displayData);
    vis.number.exit()
        .remove();
    vis.number_enter=vis.number.enter()
        .append('text')
        .attr('class','number')
        .attr('text-align','left');
    vis.number.merge(vis.number_enter)
        .transition()
        .attr('x',function(d){
            return vis.x(d.value)+4;
        })
        .attr('y',function(d){
            return vis.y(d.state)+vis.y.bandwidth()/2+5;
        })
        .text(function(d){
            var num=d.value;
            num*=100;
            return num.toFixed(2)+'%'
        })
};