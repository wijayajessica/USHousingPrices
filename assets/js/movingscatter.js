// Code excerpts from http://bl.ocks.org/jgujgu/d4821620fd3b313d83d758aee263afd0

ScatterVis = function(_parentElement, _data ){
    this.parentElement = _parentElement;
    this.data = _data;
    // console.log(this.data);
    this.initVis();
};

ScatterVis.prototype.initVis = function(){

    var vis = this;


    vis.margin = { top: 10, right: 20, bottom: 20, left: 100 };
    vis.width = 700 - vis.margin.left - vis.margin.right;
    vis.height = vis.width * 1/2;

    //Scatterplot
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Various scales. These domains make assumptions of data, naturally.
    vis.xScale = d3.scaleLinear()
        .domain([35000, 100000])
        .range([0, vis.width]);
    vis.yScale = d3.scaleLinear()
        .domain([15000, 620000])
        .range([vis.height, 0]);

    // vis.radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, width * 0.05]);

    vis.colorScale = d3.scaleOrdinal(["#cc4c02", "#fe9929", "#fed98e", "#ffffd4"]);

    // var formatX = d3.format(".1s");
    // The x & y axes.
    vis.xAxis = d3.axisBottom()
        .scale(vis.xScale);
    vis.yAxis = d3.axisLeft()
        .scale(vis.yScale);
    // var format = d3.format(".2s");

    // Add the x-axis.
    vis.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);

    // Add the y-axis.
    vis.svg.append("g")
        .attr("class", "y axis")
        .call(vis.yAxis);

    // Add an x-axis label.
    vis.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", vis.width)
        .attr("y", vis.height - 6)
        .text("Median income ($)");

    // Add a y-axis label.
    vis.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Median house price");

    // Add the year label; the value is set on transition.
    vis.label = vis.svg.append("text")
        .attr("class", "year label")
        .attr("text-anchor", "end")
        .attr("y", vis.height - 24)
        .attr("x", vis.width)
        .attr("style", "font-size:" + (vis.width * 0.12).toString() + "px")
        .text(1996);

    formatComma = d3.format(",.0f");
    // Add tooltip over circles
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .direction('s')
        .html(function(d) {
            return "<p style='font-weight: bold'>" + d.region + "</p>Region of the US: "+ d.division+
                "<br>Median Income: " + formatComma(d.income) + "<br>Median price: " + formatComma(d.price);
        });

    function x(d) { return d.income; }
    function y(d) { return d.price; }
    // function radius(d) { return d.population; }
    function color(d) { return d.division; }
    // function key(d) { return d.name; }

    // A bisector since many nation's data is sparsely-defined.
    vis.bisect = d3.bisector(function(d) { return d[0]; });

    // Add a dot per nation. Initialize the data at 1800, and set the colors.
    vis.dot = vis.svg.append("g")
        .call(vis.tip)
        .attr("class", "dots")
        .selectAll(".dot")
        .data(interpolateData(1800))
        .enter().append("circle")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)
        .attr("class", function (d) { return "dot " + d.region; })
        .style("fill", function(d) { return vis.colorScale(color(d)); })
        .call(position);
        // .sort(order);

// Add an overlay for the year label.
    vis.box = vis.label.node().getBBox();

    vis.overlay = vis.svg.append("rect")
        .attr("class", "overlay")
        .attr("x", vis.box.x)
        .attr("y", vis.box.y)
        .attr("width", vis.box.width)
        .attr("height", vis.box.height)
        .on("mouseover", enableInteraction);

    // Start a transition that interpolates the data based on year.
    vis.svg.transition()
        .duration(15000)
        .ease(d3.easeLinear)
        .tween("year", tweenYear)
        .on("end", enableInteraction);



    // Positions the dots based on data.
    function position(dot) {
        dot.attr("cx", function(d) {return vis.xScale(x(d)); })
            .attr("cy", function(d) { return vis.yScale(y(d)); })
            .attr("r", 10)
            // .attr("r", function(d) { return radiusScale(radius(d)); });
    }

    // Defines a sort order so that the smallest dots are drawn on top.
    // function order(a, b) { return radius(b) - radius(a); }

    // After the transition finishes, you can mouseover to change the year.
    function enableInteraction() {
        var yearScale = d3.scaleLinear()
            .domain([1996, 2018])
            .range([vis.box.x + 10, vis.box.x + vis.box.width - 10])
            .clamp(true);

        // Cancel the current transition, if any.
        vis.svg.transition().duration(0);

        vis.overlay
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove)
            .on("touchmove", mousemove);

        function mouseover() { vis.label.classed("active", true); }
        function mouseout() { vis.label.classed("active", false); }
        function mousemove() { displayYear(yearScale.invert(d3.mouse(this)[0])); }
    }

    // Tweens the entire chart by first tweening the year, and then the data.
    // For the interpolated data, the dots and label are redrawn.
    function tweenYear() {
        var year = d3.interpolateNumber(1998, 2018);
        return function(t) { displayYear(year(t)); };
    }

    // Updates the display to show the specified year.
    function displayYear(year) {
        // console.log(vis.dot.data(interpolateData(year), key)
        //     .call(position));
        vis.dot.data(interpolateData(year))
            .call(position);
            // .sort(order);
        vis.label.text(Math.round(year));
    }

    // Interpolates the dataset for the given (fractional) year.
    function interpolateData(year) {
        return vis.data.map(function(d) {
            return {
                // name: d.name,
                region: d.region,
                division: d.division,
                price: interpolateValues(d.price, year),
                income: interpolateValues(d.income, year),
            };
        });
    }

    // Finds (and possibly interpolates) the value for the specified year.
    function interpolateValues(values, year) {
        var i = vis.bisect.left(values, year, 0, values.length - 1),
            a = values[i];
        if (i > 0) {
            var b = values[i - 1],
                t = (year - a[0]) / (b[0] - a[0]);
            return a[1] * (1 - t) + b[1] * t;
        }
        return a[1];
    }

    // add color legend
    vis.colorLegend = d3.scaleOrdinal()
        .range(["#cc4c02", "#fe9929", "#fed98e", "#ffffd4"]) //colorbrewer.YlOrBr[4]
        .domain([ "South","West","Northeast", "Midwest"]);

    vis.svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate("+0.85*vis.width+",20)");

    var legendOrdinal = d3.legendColor()
        .shapePadding(0)
        // .title("Color Legend")
        // .titleWidth(200)
        .scale(vis.colorLegend);

    vis.svg.select(".legendOrdinal")
        .style("font-size","12px")
        .style("fill", "black")
        .call(legendOrdinal);

};