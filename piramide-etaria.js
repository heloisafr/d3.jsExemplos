

class GraficoPiramide {

	constructor(element_id, data) {
		this.element_id = element_id;
		this.data = data;
		this.width = 500;
		this.height = 250;
		this.margin = {top: 20, right: 10, bottom: 20, left: 10, middle: 20};
		this.axis_font_size = '0.7em';
		this.leftBarColor  = "#2c6bb4";
		this.rightBarColor  = "#f37120";
	}

	criar(){

		let element_id = this.element_id;
		let self = this;
		let width = this.width - this.margin.left - this.margin.right;
		let height = this.height - this.margin.top - this.margin.bottom;
		let svg = d3.select('#'+this.element_id);

		let sectorWidth = (width / 2) - this.margin.middle;
		let leftBegin = sectorWidth - this.margin.left;
		let rightBegin = width - this.margin.right - sectorWidth;

		let pyramid = svg
		    .append("g")
		    .attr("transform", "translate("+self.margin.left+","+self.margin.top+")");

		let totalPopulation = d3.sum(data, function(d) {
		    return d.male + d.female;
		});

		let percentage = function(d) {
		    return d / totalPopulation;
		};

        // find the maximum data value for whole dataset
        // and rounds up to nearest 5%
        //  since this will be shared by both of the x-axes
        var maxValue = Math.ceil(Math.max(
            d3.max(self.data, function(d) {
                return percentage(d.male);
            }),
            d3.max(self.data, function(d) {
                return percentage(d.female);
            })
        )/0.05)*0.05;

        // SET UP SCALES

        // the xScale goes from 0 to the width of a region
        //  it will be reversed for the left x-axis
        var xScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, (sectorWidth-self.margin.middle)])
            .nice();

        var xScaleLeft = d3.scaleLinear()
            .domain([0, maxValue])
            .range([sectorWidth, 0]);

        var xScaleRight = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, sectorWidth]);

        var yScale = d3.scaleBand()
            .domain(data.map(function(d) {
                return d.age;
            }))
            .range([height, 0], 0.1);

		    // SET UP AXES
        var yAxisLeft = d3.axisRight()
            .scale(yScale)
            .tickSize(4, 0)
            .tickPadding(self.margin.middle - 4);

        var yAxisRight = d3.axisLeft()
            .scale(yScale)
            .tickSize(4, 0)
            .tickFormat('');

        var xAxisRight = d3.axisBottom()
            .scale(xScale)
            .ticks(5)
            .tickFormat(d3.format('.0%'));

        var xAxisLeft = d3.axisBottom()
        // REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
            .scale(xScale.copy().range([leftBegin, 0]))
            .ticks(5)
            .tickFormat(d3.format('.0%'));

		   // DRAW AXES
        pyramid.append('g')
            .attr("transform", "translate("+leftBegin+",0)")
            .call(yAxisLeft)
            .selectAll('text')
            .style('text-anchor', 'middle');

        pyramid.append('g')
            .attr("transform", "translate("+rightBegin+",0)")
            .call(yAxisRight);

        pyramid.append('g')
            .attr("transform", "translate(0,"+height+")")
            .call(xAxisLeft);

        pyramid.append('g')
            .attr("transform", "translate("+rightBegin+","+height+")")
            .call(xAxisRight);

        // MAKE GROUPS FOR EACH SIDE OF CHART
        // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
        var leftBarGroup = pyramid.append('g')
            .attr("transform", "translate("+leftBegin+",0) scale(-1,1)");
        var rightBarGroup = pyramid.append('g')
            .attr("transform", "translate("+rightBegin+",0)");

        let barHeight = (yScale.range()[0] / data.length) - self.margin.middle / 2;

        leftBarGroup.selectAll('.bar.left')
            .data(data)
            .enter().append('rect')
            .attr('x', 0)
            .attr('fill', self.leftBarColor)
            .attr('y', function(d) {
                return yScale(d.age) + self.margin.middle / 4;
            })
            .attr('width', function(d) {
                return xScale(percentage(d.male));
            })
            .attr('height', barHeight);

        rightBarGroup.selectAll('.bar.right')
            .data(data)
            .enter()
            .append('rect')
            .attr('fill', self.rightBarColor)
            .attr('x', 1)
            .attr('y', function(d) {
                return yScale(d.age) + self.margin.middle / 4;
            })
            .attr('width', function(d) {
                return xScale(percentage(d.female));
            })
            .attr('height', barHeight);

        //-- TEXTO DAS BARRAS  À DIREITA -----------------------------------------------------------
        rightBarGroup.selectAll('.bar.right')
            .data(data)
            .enter()
            .append('text')
            .text(function(d) {
                let value = percentage(d.female)*100;
                value = value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})+'%';
                return value;
            })
            .style("font-size", self.axis_font_size)
            .attr('fill', self.rightBarColor)
            .attr('x', function(d){
                return xScale(percentage(d.female));
            })
            .attr('y', function(d) {
                return yScale(d.age) + self.margin.middle / 4 + barHeight;
            })
            .attr('dy', '-0.3em')
            .attr('dx', '0.3em');

        //-- TEXTO DAS BARRAS À ESQUERDA -----------------------------------------------
        var gLeftText = pyramid.append('g')
            .attr("transform", "translate("+leftBegin+",0)");

        gLeftText.selectAll('.bar.right')
            .data(data)
            .enter()
            .append('text')
            .text(function(d) {
                let value = percentage(d.male)*100;
                value = value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})+'%';
                return value;
            })
            .style("text-anchor", "end")
            .style("font-size", self.axis_font_size)
            .attr('fill', self.leftBarColor)
            .attr('x', function(d){
                let value = xScale(percentage(d.male))*-1;
                return value;
            })
            .attr('y', function(d) {
                return yScale(d.age) + self.margin.middle / 4 + barHeight;
            })
            .attr('dy', '-0.3em')
            .attr('dx', '-0.3em');

	}
}