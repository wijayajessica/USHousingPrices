function chart() {

    const dataset = [
        {start: 2020000, target: 'A'},
        {start: 2340000, target: 'B'},
        {start: 2660000, target: 'C'},
        {start: 2980000, target: 'D'},
    ]


    margin = ({top: 10, right: 50, bottom: 20, left: 50})

    height = 120

    width = 1500

    x = d3.scaleLinear()
        .domain([ 200000,  4800000])
        .rangeRound([margin.left, width - margin.right])

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom-10})`)
        .style("font", "30px times")
        .call(g => g.append("g")
            .call(d3.axisBottom(x)
                .ticks(20)
                // this controls the height of the axis we are looking at
                .tickSize(-height + margin.top + margin.bottom+80)
                .tickFormat(d3.format(".2s"))
            )
            .call(g => g.select(".domain")
                .attr("fill", null)
                .attr("stroke", null))
            .call(g => g.selectAll(".tick line")
                .attr("stroke", "#ddd")
                .attr("stroke-opacity", d => d <= d3.timeHour(d) ? 1 : 0.5)))


    var xScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) {
            return d.x_pos
        })]).range([0, width]);

    svg = d3.select("#timeline").append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("stroke-width", 2);
    // const svg = d3.create("svg")
    //     .attr("viewBox", [0, 0, width, height])
    //     .attr("stroke-width", 2);

    const axis = svg.append("g")
        .attr('id', 'xAxis')
        .style("font", "30px times")
        .call(xAxis)

    d3.selectAll(".tick > text")
        .style("font-size", "20px")

    function drawCircleGroups(dataset) {
        const circleContainer = svg.append('g').attr('id','circleContainer')

        var group = circleContainer.selectAll('g')
            .data(dataset)
            .enter()
            .append("g")
            .attr('id', d => d.target)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));


        var image_list = ["images/arkansas_725k.jpg", "images/Atherton_3.6M.jpg", "images/palo_2.5M.jpg", "images/west_virginia_390k.jpg"];
        var rectcolor_list = ["darkred", "yellow", "darkblue", "white"];

        group.append("rect")
            .attr("class", "rectborder")
            .attr("x", function(d) { return x(d.start)-2.5; })
            .attr("y", 7.5)
            .attr("width", 85)
            .attr("height", 65)
            .style("stroke",function (d, i) {return rectcolor_list[i]})
            .style("stroke-width","4")
            .style("fill",null);


        group.append("image")
            .attr("class", "drag_image")
            .attr("width", 80)
            .attr("height", 80)
            .attr("xlink:href", function(d, i){return image_list[i];})
            .attr("x", d => x(d.start));

    }

    svg.append("text")
        .attr("class", "instructions")
        .text("<- drag me")
        .attr("x", x(3300000))
        .attr("y", 20)
        .style("fill", "white")

    svg.append("text")
        .text("($)")
        .attr("x", x(4800000)+26)
        .attr("y", 106)
        .style("fill", "#7d7d7f")
        .style("font-weight", "bold")

    drawCircleGroups(dataset);

    function dragstarted(d) {
        d3.select(this).raise().attr("stroke", "black")
        d3.selectAll(".instructions").text("")
    }

    function dragged(d) {
        d3.select(this).selectAll('.drag_image') // .selectAll("circle") not working....
            .attr("x", d.x = d3.event.x);
            // .attr("cy", d.y = 55);
        d3.select(this).selectAll('.rectborder') // .selectAll("text") not working....
            .attr("x", d.x = d3.event.x - 2.5)
            .attr("y", d.y = 7.5);
    }

    function dragended(d) {
        d3.select(this).attr("stroke", null);
    }

    function updatedrawCircleGroups(dataset) {
        const circleContainer = svg.append('g').attr('id','circleContainer')

        format = d3.format(",")
        tip = d3.tip()
            .attr('class', 'd3-tip')
            .direction('s')
            .html(function(d) {
                return "<strong> <sopan style='color:white'> House price:</strong> <span style='color:#D35400'>$" + format(d.start) + "</span><br>" +
                    "<strong style='color:white'>Location:</strong> <span style='color:white'>" + d.location + '</span><br>'
                    + "<strong style='color:white'>Area:</strong> <span style='color:white'>" + d.area + '</span><br>'

            });

        var group = circleContainer.selectAll('g')
            .data(dataset)
            .enter()
            .append("g")
            .attr('id', d => d.target)
            .call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            // .call(d3.drag()
            //     .on("start", dragstarted)
            //     .on("drag", dragged)
            //     .on("end", dragended))

        // group.append("circle")
        //     // .transition()
        //     // .delay(function(d,i){ return i * 2000 })
        //     // .duration(2000)
        //     // .ease(d3.easeLinear)
        //     .attr("cx", d => x(d.start))
        //     .attr("cy", 55)
        //     .attr("r", 30)
        //     .attr("fill", "#D35400" );
        var rectcolor_list = ["darkred", "yellow", "darkblue", "white"];

        group.append("rect")
            .attr("class", "rectborder")
            .attr("x", function(d) { return x(d.start)-2.5; })
            .attr("y", 7.5)
            .attr("width", 85)
            .attr("height", 65)
            .style("stroke",function (d, i) {return rectcolor_list[i]})
            .style("stroke-width","4")
            .style("fill",null);

        var image_list = ["images/arkansas_725k.jpg", "images/Atherton_3.6M.jpg", "images/palo_2.5M.jpg", "images/west_virginia_390k.jpg"];

        group.append("image")
            .attr("class", "drag_image")
            .attr("width", 80)
            .attr("height", 80)
            .attr("xlink:href", function(d, i){
                return image_list[i];
            })
            // .attr("y", 55)
            .attr("x", d => x(d.start));

        // group.append("text")
        //     // .transition()
        //     // .delay(function(d,i){ return i * 2000 })
        //     // .duration(2000)
        //     // .ease(d3.easeLinear)
        //     .attr("x", function(d) { return x(d.start) - 10; })
        //     .attr("y", function(d) { return 60; })
        //     .style("fill", "white")
        //     .text(function(d) { return d.target })
    }

    d3.select('#check')
        .on('click', function() {
            const new_dataset = [
                {location: "Rogers, Arkansas", area: "2,995 sqft", start: 725000, target: 'A'},
                {location: "Atherton, California", area: "3,248 sqft", start: 3600000, target: 'B'},
                {location: "Palo Alto, California", area: "1,614 sqft", start: 2500000, target: 'C'},
                {location: "Charles Town, West Virginia", area: "5,300 sqft", start: 390000, target: 'D'},
            ]

            d3.selectAll(".instructions").text("");
            d3.selectAll(".drag_image")
                .attr("opacity", "0.2");
            d3.selectAll(".rectborder")
                .style("stroke-opacity","0.2");


            updatedrawCircleGroups(new_dataset);

            var display_div = document.getElementById('explanation');

            display_div.innerHTML += "<h3 id='explanation_heading'> Checking your assumptions </h3>"+
                "<p id='explanation_text'> You were close! Compare the newly added circles, which are the correct ordering of housing prices," +
                " versus your ordering. Hover over the new circles to learn more about each house, such as their location and area. Keep in mind that these houses were actual houses sold within the past twelve months on the Zillow platform, so their price accurately reflects the marketplace price. Importantly, focus on the location of the houses. While the two houses located in Arkansas and West Virginia appear the most impressive in appearance, they are vastly more affordable than houses B and C, which are located in Atherton, CA and Palo Alto, CA, two of the most expensive zip codes from our research. In fact, the Atherton house is almost ten times more expensive than the larger house located in West Virginia. Did you order the four houses correctly? If not, read on to examine the history of housing prices and understand how housing prices and affordability have changed and evolved." +
                "</p>";
        });

    return svg.node();

}

chart();

