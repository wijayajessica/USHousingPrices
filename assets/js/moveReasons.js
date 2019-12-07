MoveReasons=function(_parentElement,_sliderElement,_data){
    this.parentElement=_parentElement;
    this.sliderElement=_sliderElement;
    this.data=_data;

    this.initVis();
};

MoveReasons.prototype.initVis=function(){
    var vis=this;
    vis.margin={left:215,right:40,top:20,bottom:10};
    vis.width=$(vis.parentElement).width()-vis.margin.left-vis.margin.right;
    vis.height=400-vis.margin.top-vis.margin.bottom;
    vis.svg=d3.select(vis.parentElement)
        .append('svg')
        .attr('width',vis.width+vis.margin.left+vis.margin.right)
        .attr('height',vis.height+vis.margin.top+vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x=d3.scaleLinear()
        .range([0,vis.width]);
    vis.y=d3.scaleBand()
        .range([vis.height,0])
        .paddingInner(0.1);
    vis.yAxis=d3.axisLeft();

    vis.data.forEach(function(d){
        for(var i in d){
        d[i]=+d[i];
        }
    });
    console.log(vis.data);

    vis.bracketText=vis.svg
        .append('text')
        .text('')
        .attr('x',-vis.margin.left+5)
        .attr('y',-5)
        .attr('text-anchor','left');

    vis.tops={0:9999,10000:19999,20000:29999,30000:39999,40000:49999,50000:59999,60000:69999,70000:84499,85000:99999,100000:'100000+'};

    vis.slider=d3.sliderBottom()
        .min(0)
        .max(100000)
        .width($(vis.parentElement).width()-100)
        .tickValues([0,10000,20000,30000,40000,50000,60000,70000,85000,100000])
        .marks([0,10000,20000,30000,40000,50000,60000,70000,85000,100000])
        .default([0,100000])
        .on('onchange',val=>{
            vis.wrangleData(val[0],val[1]);
        });

    vis.gStep = d3.select(vis.sliderElement)
        .append('svg')
        .attr('width', $(vis.parentElement).width())
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    vis.gStep.call(vis.slider);

    vis.wrangleData(0,100000)
};

MoveReasons.prototype.wrangleData=function(start,end){
    var vis=this;
    vis.start=start;
    vis.end=end;

    vis.displayData=[];
    vis.data.forEach(function(d){
        if(d.Income===vis.start){
            for(var i in d){
                if(i!='Income'){
                    vis.displayData.push({reason:i,value:d[i]})
                };
            };
        };
    });

    if(vis.start!=vis.end){
        vis.data.forEach(function(d){
            if(d.Income>vis.start&&d.Income<=vis.end){
                for(var i in d){
                    vis.displayData.forEach(function(j){
                        if(i===j.reason){
                            j.value+=d[i];
                        };
                    });
                };
            };
        });
    };
    vis.displayData.sort(function(a,b){
        return a.value-b.value;
    });

    vis.updateVis();
};

MoveReasons.prototype.updateVis=function(){
    var vis=this;

    vis.y
        .domain(vis.displayData.map(function(d){
            return d.reason;
        }));
    vis.yAxis
        .scale(vis.y);
    vis.x
        .domain([0,d3.max(vis.displayData,function(d){
            return d.value;
        })]);

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
        .attr("y", function(d) { return vis.y(d.reason); })
        .attr("width", function(d) { return vis.x(d.value); })
        .attr("height", 50);
        // .attr("height", vis.y.bandwidth());

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
            return vis.y(d.reason)+vis.y.bandwidth()/2+5;
        })
        .text(function(d){
            return d.value;
        });

    vis.bracketText
        .text('Household Income: $'+vis.start+' - $'+ vis.tops[vis.end])
        .attr('fill','white');

};