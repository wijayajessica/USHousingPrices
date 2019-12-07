

ForceDiagram = function(_parentElement, _twoBedroomData, _threeBedroomData,
                        _fourBedroomData, _fiveBedroomData, _per_sqr_ft ){
    this.parentElement = _parentElement;
    this.data = _twoBedroomData;
    this.displayData = _twoBedroomData;
    this.twoBedroomData = _twoBedroomData;
    this.threeBedroomData = _threeBedroomData;
    this.fourBedroomData = _fourBedroomData;
    this.fiveBedroomData = _fiveBedroomData;
    this.perSqrFoot = _per_sqr_ft;
    this.splitSelection = "all";
    this.sortSelection = "Highest";
    this.dataCategorySelection = "2bed";
    this.initVis();
};

ForceDiagram.prototype.initVis = function() {
    var vis = this;

    document.querySelector('#sort-by-button').innerHTML = 'Most Expensive';
    document.querySelector('#data-cat-button').innerHTML = '2-Bedroom Homes ';
    document.querySelector('#group-by-button').innerHTML = 'All';


    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    vis.w = 1100 - vis.margin.left - vis.margin.right;
    // vis.w = 960 - vis.margin.left - vis.margin.right;
    vis.h = vis.w * 1/2;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.w + vis.margin.left + vis.margin.right)
        .attr("height", vis.h + vis.margin.top + vis.margin.bottom);

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + 10 + "," + vis.margin.top + ")");

    vis.node = vis.g.append("g").selectAll(".node");

    vis.centerScale = d3.scalePoint().padding(1).range([0, vis.w]);
    console.log(vis.w);
    vis.forceStrength = 0.5;

    vis.radiusScale = d3.scaleLinear()
        .range([8, 18]);

    vis.color = d3.scaleOrdinal()
        .range(colorbrewer.YlOrBr[4])
        .domain(["Midwest", "Northeast","West","South"]);

    vis.svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate("+0.8*vis.w+","+vis.h*0.8+")");

    var legendOrdinal = d3.legendColor()
        .shapePadding(0)
        // .title("Color Legend")
        // .titleWidth(200)
        .scale(vis.color);

    vis.svg.select(".legendOrdinal")
        .style("font-size","12px")
        .style("fill", "white")
        .call(legendOrdinal);


    // Add tooltip over circles
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .attr('id', 'forceToolTip')
        .direction('s');

    vis.simulation = d3.forceSimulation(vis.displayData)
        .force("collide", d3.forceCollide( function(d){
            return vis.radiusScale(d['2019-10']) + .5 }).iterations(30)
        )
        .force("charge", d3.forceManyBody().strength(10))
        .force("y", d3.forceY().y(vis.h / 2))
        .force("x", d3.forceX().x(vis.w / 2));

    vis.setUpButtons();

    vis.wrangleData(vis.sortSelection, vis.dataCategorySelection);

};

ForceDiagram.prototype.wrangleData = function(highLowToggle, dataCategorySelection){
    var vis = this;

    // console.log("How we're splitting: " + vis.splitSelection);
    // console.log("Highest or lowest: " + id);

    if (dataCategorySelection == "2bed") {
        vis.data = vis.twoBedroomData;
    } else if (dataCategorySelection == "3bed") {
        vis.data = vis.threeBedroomData;
    } else if (dataCategorySelection == "4bed") {
        vis.data = vis.fourBedroomData;
    } else if (dataCategorySelection == "5bed") {
        vis.data = vis.fiveBedroomData;
    } else {
        vis.data = vis.perSqrFoot;
    }

    vis.data.forEach(function (element) {
        element['2019-10'] = +element['2019-10'];
    });

    // Sort by highest or lowest prices
    if (highLowToggle == "Highest") {
        // Sort descending by price
        vis.data.sort( function(a, b){
            return b['2019-10'] - a['2019-10'];
        });
    } else {

        vis.data.sort( function(a, b){
            return a['2019-10'] - b['2019-10'];
        });
    }

    // Only grab the top 100
    var temp = [];
    var counter = 0;
    vis.data.forEach(function (element) {
        if (counter < 50) {
            temp.push(element);
        }
        counter++;
    });

    vis.displayData = temp;

    vis.radiusScale.domain(d3.extent(vis.displayData, function(d){return d['2019-10'];}));

    vis.drawDiagram();

    // Split by currently active button "all" "Region" or "State"
    vis.splitBubbles(vis.splitSelection);

};

ForceDiagram.prototype.drawDiagram = function(){
    var vis = this;

    formatComma = d3.format(",.0f");

    var t = d3.transition()
        .duration(750);


    vis.tip
        .html(function(d) {
        return "<p><strong>" + d['City'] + ", " + d['State'] +
            "<br></p><p><strong> ZIP : </strong>" + d['RegionName'] +
            "</p><p><strong> Avg Cost : </strong>" + "$" + formatComma(d['2019-10']);
        });

    vis.node = vis.node.data(vis.displayData);

    vis.node.exit()
        .style("fill", "#b26745")
        .transition(t)
        .attr("r", 1e-6)
        .remove();

    vis.node
        .transition(t)
        .style("fill", function(d, i){
            return vis.color(d['Region']);
        })
        .attr("r", function(d, i){ return vis.radiusScale(d['2019-10']); });

    vis.node = vis.node.enter().append("circle")
        .attr("r", function(d, i){ return vis.radiusScale(d['2019-10']); })
        .attr("cx", function(d, i){
            return 175 + 25 * i + 2 * i ** 2;
        })
        .attr("cy", function(d, i){
            return 250;
        })
        .style("fill", function(d, i){
            return vis.color(d['Region']);
        })
        .merge(vis.node)
        .call(vis.tip)
        .style("pointer-events", "all")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide);


    function ticked() {
        vis.node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
    }

    vis.simulation
        .nodes(vis.displayData)
        .on("tick", ticked);

};

ForceDiagram.prototype.setUpButtons = function(){
    var vis = this;

    d3.selectAll('.button')
        .on('click', function () {

            d3.selectAll('.button').classed('active', false);
            var button = d3.select(this);

            button.classed('active', true);

            var buttonId = button.attr('id');

            vis.splitSelection = buttonId;

            document.querySelector('#group-by-button').innerHTML = button.attr('value');

            vis.splitBubbles(buttonId);
        });

    d3.selectAll('.highlowtoggle')
        .on('click', function () {

            d3.selectAll('.highlowtoggle').classed('active', false);

            var button = d3.select(this);

            button.classed('active', true);
            var buttonId = button.attr('id');

            vis.sortSelection = buttonId;

            document.querySelector('#sort-by-button').innerHTML = button.attr('value');

            // wrangleData(highlowtoggle, dataCategorySelection)
            vis.wrangleData(buttonId, vis.dataCategorySelection);
        });

    d3.selectAll('.datacatagory')
        .on('click', function () {

            d3.selectAll('.datacatagory').classed('active', false);

            var button = d3.select(this);

            button.classed('active', true);
            var buttonId = button.attr('id');

            vis.dataCategorySelection = buttonId;

            document.querySelector('#data-cat-button').innerHTML = button.attr('value');

            vis.wrangleData(vis.sortSelection, buttonId);
        });

};

ForceDiagram.prototype.splitBubbles = function(byVar){
    var vis = this;

    vis.centerScale.domain(vis.displayData.map(function(d){ return d[byVar]; }));

    if(byVar == "all"){
        vis.hideTitles()
    } else {
        vis.showTitles(byVar);
    }

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(function(d){
        return vis.centerScale(d[byVar]);
    }));

    // @v4 We can reset the alpha value and restart the simulation
    vis.simulation.alpha(2).restart();

};


ForceDiagram.prototype.hideTitles = function(byVar) {
    var vis = this;
    vis.svg.selectAll('.title').remove();

};

ForceDiagram.prototype.showTitles = function(byVar) {
    var vis = this;

    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var titles = vis.svg.selectAll('.title')
        .data(vis.centerScale.domain());

    titles.enter().append('text')
        .attr('class', 'title')
        .merge(titles)
        .attr('x', function (d) { return vis.centerScale(d); })
        .attr('y', 40)
        .style("fill", "white")
        .attr('text-anchor', 'middle')
        .text(function (d) { return d; });

    titles.exit().remove();

};
