
/**
 * Cria um gráfico com barras (com categoria e sub categoria) e uma linha - todos no mesmo eixo Y
 * Uso:

    try {

        let data = [
            {"categorie": "2018", "values": [{"value": 9, "rate": "número1"}, {"value": 12, "rate": "número2"}]},
            {"categorie": "2019", "values": [{"value": 10, "rate": "número1"}, {"value": 15, "rate": "número2"}]}
            ]

        let grafico = new GraficoBarrasSubCategoria('grafico', data);
        grafico.criar();

    } catch (err) {
        console.log(err)
    }

 */


class GraficoBarrasSubCategoria {

    constructor(element_id, data) {
        this.element_id = element_id;
        this.data = data;
        this.width = 600;
        this.height = 300;
        this.margin = {top: 10, right: 10, bottom: 40, left: 60};
        this.axis_font_size = '0.9em';
        this.labels_font_size = '1em';
        this.y_title = null;
        this.colors  = ["#2c6bb4","#f37120",'#00c1f3'];
    }

    criar(){

        let self = this;
        let width = this.width - this.margin.left - this.margin.right;
        let height = this.height - this.margin.top - this.margin.bottom;
        let svg = d3.select('#'+this.element_id);

        svg.append('style')
            .text('.axis-barra-sub-categoria .domain, .axis-barra-sub-categoria line {display:none;}');

        var g = svg
            .append("g")
            .attr("transform", "translate("+self.margin.left+","+self.margin.top+")");

        // eixo Y ------------------------------------------------------------
        let maxData = d3.max(self.data, function(categorie){ return d3.max(categorie.values, function(d) { return d.value; }); });
        let maxDomain = maxData+(maxData/7);
        let minData = d3.min(self.data, function(categorie){ return d3.min(categorie.values, function(d) { return d.value; }); });
        let minDomain = (minData>0 ? 0 : minData+(minData/7));
        var y = d3.scaleLinear()
            .domain([minDomain, maxDomain])
            .range([height, 0]);
        this.yAxis = d3.axisLeft(y);

        self.formatarEixoY();

        // coloca o eixo no grupo
        g.append("g")
            .call(this.yAxis)
            .style('font-size', self.axis_font_size);

        // scala para X0 (categorias) -----------------------------------
        var categories = self.data.map(function(d) { return d.categorie; });
        var eixoCategorias = d3.scaleBand()
            .domain(categories)
            .range([0, width], .1);
        let xAxis = d3.axisBottom(eixoCategorias);

        var start_line = eixoCategorias.bandwidth()/2;

        // coloca o eixo categorias no grupo
        svg.append("g")
            .attr("class", "axis-barra-sub-categoria") // esse cara que vai esconder a linha
            .attr("transform", "translate(" + self.margin.left + "," + (height+(self.margin.bottom)/2) + ")")
            .call(xAxis)
            .style('font-size', self.axis_font_size);

        // cria os grupos de categorias
        var grupos = g.selectAll(".nada") // esquisito - mas é isso mesmo
            .data(self.data) // passa os dados para o grupo
            .enter()
            .append("g")
            .attr("transform",function(d) { return "translate(" + eixoCategorias(d.categorie) + ",0)"; });

        // traça linha no eixo X (visual)
        g.append("line")
            .attr("y1", y(0))
            .attr("y2", y(0))
            .attr("x1", 0)
            .attr("x2", width)
            .attr("stroke", "black");

        var subcategories = self.data[0].values.map(function(d) { return d.rate; });
        var eixoSubCategorias = d3.scaleBand()
            .domain(subcategories)
            .range([0, eixoCategorias.bandwidth()])
            .paddingOuter(0.25)
            .paddingInner(0.05);

        var bars = grupos.selectAll("rect") // nao tem retangulo ainda mas é assim mesmo
            .data(function(d) { return d.values; })
            .enter()
            .append("rect") // agora sim cria os retangulos com os dados
            .attr("x",function(d){ return eixoSubCategorias(d.rate);})
            .attr("y",y(0))
            .attr("width",eixoSubCategorias.bandwidth())
            .attr("height",0)
            .attr("fill","none")
            .on("mouseover", function(d) { self.overBars(); })
            .on("mouseout", function(d) { self.outBars(); });

        // cores
        var colorScale= d3.scaleOrdinal()
            .range(self.colors);

        // coloca animação
        bars.transition()
            .duration(1500)
            .attr("y", function(d) { return (d.value<0 ? y(0) : y(d.value));  })
            .attr("height", function(d){ return Math.abs(y(d.value) - y(0)); })
            .attr("fill", function(d){ return colorScale(d.rate); });

        // coloca texto nas barras
        grupos.selectAll("text")
            .data(function(d) { return d.values; })
            .enter()
            .append("text")
            .text(function(d){ return self.formatarValoresBarra(d.value); })
            .attr("y",function(d) { return y(d.value); })
            .attr("x",function(d){ return eixoSubCategorias(d.rate);})
            .attr("dx","0.1em")
            .attr("dy",function(d){ return (d.value<=0 ? "0.9em" : "-0.3em"); })
            .style('font-size', self.labels_font_size)
            .attr("fill", function(d){ return colorScale(d.rate); })
            .attr("class", self.element_id+'-bar-text')
            .on("mouseover", function(d) { self.overBars(); })
            .on("mouseout", function(d) { self.outBars(); });

        // -- desenha a LINHA ----------------------------------------------------------------------

        if(self.y_title){
            g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style('font-size', self.labels_font_size)
            .style("text-anchor", "middle")
            .text(self.y_title);
        }
    }

    /**
     * Formata os valores do eixo Y do gráfico
     */
    formatarEixoY(){
        let self = this;
        self.yAxis.tickFormat(function (d) {
            return self.formatarValor(d);
        }).ticks(7);
    }

    /**
     * Formata os valores das barras
     */
    formatarValoresBarra(valor){
        return this.formatarValor(valor);
    }

    /**
     * Formata os valor
     */
    formatarValor(valor){
        return valor.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
    }

    /**
     * Ação do mouseover na linha
     */
    overBars(){
        let element_id = this.element_id;
        d3.selectAll('.'+element_id+'-bar-text').attr('stroke', "#000");
    }

    /**
     * Ação do mouseout na linha
     */
    outBars(){
        let element_id = this.element_id;
        d3.selectAll('.'+element_id+'-bar-text').attr('stroke', null);
    }
}