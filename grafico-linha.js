/**
    Esse grafico não serve se a escala do eixo X iniciar do zero, pois o formado da escala é scaleBand e não scaleLinear
    data = [
        {"serie":"Serie 1", "values": [
            {"rate": "2019", "value": 10}, {"rate": 2020, "value": 15}
            ]},
        {"serie":"Serie 2", "values": [
            {"rate": "2019", "value": 9}, {"rate": 2020, "value": 18}
            ]},
    ]

    try {
        let grafico = new GraficoMultiplasLinhas('grafico', data);
        grafico.criar();
    } catch (err) {
        console.log(err)
    }

    @author Heloisa
 */

class GraficoMultiplasLinhas {

    constructor(element_id, data) {
        this.element_id = element_id;
        this.data = data;
        this.width = 800;
        this.height = 380;
        this.margin = {top: 20, right: 10, bottom: 30, left: 50};
        this.axis_font_size = '0.9em';
        this.labels_font_size = '1em';
        this.y_title = null;
        this.colors  = ["#2c6bb4","#f37120",'#00c1f3'];
        this.y_ticks = 7;
    }

    criarEixoX(){

        let rates = this.data[0].values.map(function(d) { return d.rate; });
        this.eixoX = d3.scaleBand()
            .domain(rates)
            .range([0, this.g_width]);
        let xAxis = d3.axisBottom(this.eixoX);

        this.start_line = this.eixoX.bandwidth()/2;

        this.g.append("g")
            .attr("transform", "translate(0,"+ this.g_height + ")")
            .call(xAxis)
            .style('font-size', self.axis_font_size);
    }

    criar(){

        this.g_height = this.height - this.margin.top - this.margin.bottom;
        this.g_width = this.width - this.margin.left - this.margin.right;

        let element_id = this.element_id;
        let self = this;
        let svg = d3.select('#'+this.element_id);

        this.g = svg
            .append("g")
            .attr("transform", "translate("+self.margin.left+","+self.margin.top+")");

        // eixo X ----------------------------------------------------------
        this.criarEixoX();

        // eixo Y -------------------------------------------------------
        let maxData = d3.max(self.data, function(serie){ return d3.max(serie.values, function(d) { return d.value; }); });
        let maxDomain = maxData+(maxData/10);
        var y = d3.scaleLinear()
            .domain([0,maxDomain])
            .range([this.g_height,0]);
        this.yAxis = d3.axisLeft(y);

        self.formatarEixoY();

        // coloca o eixo no grupo
        this.g.append("g")
            .attr("transform", "translate(0,0)")
            .call(this.yAxis)
            .style('font-size', self.axis_font_size);


        // -- DESENHA AS LINHAS ---------------------------------------
        var line = d3.line()
            .x(function(d) {return self.eixoX(d.rate)+self.start_line;})
            .y(function(d) { return y(d.value); })
            .curve(d3.curveMonotoneX);

        for(let s=0;s<self.data.length;s++){

            // -- desenha as linhas
            this.g.append('path')
                .attr('d', line(self.data[s].values))
                .attr('id', element_id+'l'+s)
                .attr("stroke", self.colors[s])
                .attr("stroke-width", "3")
                .attr('fill', 'none')
                .on("mouseover", function(d) { self.overLine(s); })
                .on("mouseout", function(d) { self.outLine(s); });

            // -- coloca os pontos
            this.g.selectAll(".dot")
                .data(self.data[s].values)
                .enter()
                .append("circle")
                .attr('id', function(d, i) { return element_id+'l'+s+'d'+i; } )
                .attr("stroke", "#fff")
                .attr("fill", self.colors[s])
                .attr("cx", function(d) { return self.eixoX(d.rate)+self.start_line; })
                .attr("cy", function(d) { return y(d.value); })
                .attr("r", 4)
                .on("mouseover", function(d) { self.overLine(s); })
                .on("mouseout", function(d) { self.outLine(s); });
        }

        // -- coloca o texto ------------------------------------
        // coloquei o texto em outro loop para que o texto sobreescreva todas as linhas
        for(let s=0;s<self.data.length;s++){
            this.g.selectAll(".text")
                .data(self.data[s].values)
                .enter()
                .append("text")
                .text(function(d) {
                    let value = self.formatarValoresLinha(d.value);
                    return value;
                })
                .attr('id', function(d, i) { return element_id+'l'+s+'t'+i; } )
                .attr("y",function(d) { return y(d.value);})
                .attr("x",function(d) { return self.eixoX(d.rate)+self.start_line;})
                .attr("dx", 0)
                .attr("dy", "-0.5em")
                .style('font-size', self.labels_font_size)
                .attr("fill", self.colors[s]);
        }

        if(self.y_title){
            this.g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (this.g_height / 2))
            .attr("dy", "1em")
            .style('font-size', self.labels_font_size)
            .style("text-anchor", "middle")
            .text(self.y_title);
        }

    }

    overLine(linha){
        let element_id = this.element_id;
        d3.select('#'+element_id+'l'+linha).attr("stroke-width", "3");
        $.each(this.data[linha].values,function(i, v){
            d3.select('#'+element_id+'l'+linha+'d'+i).attr("r", 5);
            d3.select('#'+element_id+'l'+linha+'t'+i).attr('stroke', "#000");
        });
    }

    outLine(linha){
        let element_id = this.element_id;
        d3.select('#'+element_id+'l'+linha).attr("stroke-width", "2");
        $.each(this.data[linha].values,function(i, v){
            d3.select('#'+element_id+'l'+linha+'d'+i).attr("r", 4);
            d3.select('#'+element_id+'l'+linha+'t'+i).attr('stroke', null);
        });
    }

    /**
     * Formata os valores do eixo Y do gráfico
     */
    formatarEixoY(){
        let self = this;
        self.yAxis.tickFormat(function (d) {
            return self.formatarValor(d);
        }).ticks(self.y_ticks);

    }

    /**
     * Formata os valores da linha
     */
    formatarValoresLinha(valor){
        return this.formatarValor(valor);
    }

    /**
     * Formata os valor
     */
    formatarValor(valor){
        return valor.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
    }

}