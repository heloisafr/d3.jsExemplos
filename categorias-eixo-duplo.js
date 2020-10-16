/**
 * Cria um gráfico com barras (com categoria e sub categoria) e multiplas linhas em EIXOS SEPARADOS
 * Uso:

    try {

        let bar_data = [
            {"categorie": "2018", "values": [{"value": 9, "rate": "número1"}, {"value": 12, "rate": "número2"}]},
            {"categorie": "2019", "values": [{"value": 10, "rate": "número1"}, {"value": 15, "rate": "número2"}]}
        ]

        let line_data = [{"categorie": "2018", "value": 15}, {"categorie": "2019", "value": 19}]

        grafico = new criarGraficoBarrasSubCategoriaComLinhaEixosSeparados('grafico', bar_data, line_data);
        grafico.bars_y_title = 'Número 1';
        grafico.line_y_title = 'Número 2';
        grafico.sobrepor_eixos = false;
        grafico.width = 800;
        grafico.line_height = 200;
        grafico.bars_height = 400;
        grafico.criar();

    } catch (err) {
        console.log(err)
    }

 */

class LinhasGraficoBarrasSubCategoriaComLinhaEixosSeparados extends GraficoMultiplasLinhas {

    criarEixoX(){

        let rates = this.data[0].values.map(function(d) { return d.rate; });
        this.eixoX = d3.scaleBand()
            .domain(rates)
            .range([0, this.g_width]);
        let xAxis = d3.axisBottom(this.eixoX);

        this.start_line = this.eixoX.bandwidth()/2;
    }

    formatarValor(valor){
        return valor.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})+'%';
    }
}

class GraficoBarrasSubCategoriaComLinhaEixosSeparados {

    constructor(element_id, bars_data, line_data) {
        this.element_id = element_id;
        this.bars_data = bars_data;
        this.line_data = line_data;
        this.width = 800;
        this.line_height = 200;
        this.bars_height = 400;
        this.margin = {top: 10, right: 20, bottom: 40, left: 60};
        this.axis_font_size = '0.9em';
        this.labels_font_size = '1em';
        this.bars_y_title = null;
        this.line_y_title = null;
        this.bars_colors  = ["#2c6bb4","#f37120",'#00c1f3'];
        this.line_color = "#39ff14";
        this.sobrepor_eixos = false;
    }

    criarBarras(){

        let id = this.element_id+'_barras';
        this.svg.append("g")
            .attr('id', id)
            .attr("transform", "translate(0," + this.line_height + ")");
        let grafico = new GraficoBarrasSubCategoria(id, this.bars_data);
        grafico.height = this.bars_height;
        grafico.width = this.width;
        grafico.margin = this.margin;
        grafico.axis_font_size = this.axis_font_size;
        grafico.labels_font_size = this.labels_font_size;
        grafico.y_title = this.bars_y_title;
        grafico.colors = this.bars_colors;
        grafico.criar();

        this.grafico_barras = grafico;
    }

    criarLinha(){

        let values = []
        $.each(this.line_data, function(i, v){
            let obj =  {"rate": v.categorie, "value": v.value}
            values.push(obj)
        })
        let data = [{"serie": "whatever", "values": values}]

        let id = this.element_id+'_linha';
        console.log(this.sobrepor_eixos)
        if( this.sobrepor_eixos ){
             this.svg.append("g")
                .attr('id', id)
                .attr("transform", "translate(0," + 350 + ")");
        } else {
            this.svg.append("g")
                .attr('id', id)
                .attr("transform", "translate(0," + this.margin.top + ")");
        }

        let grafico = new LinhasGraficoBarrasSubCategoriaComLinhaEixosSeparados(id, data);
        if(this.sobrepor_eixos){
            grafico.height = this.line_height;
        } else {
            grafico.height = this.bars_height;
        }
        grafico.width = this.width;
        grafico.margin = this.margin;
        grafico.axis_font_size = this.axis_font_size;
        grafico.labels_font_size = this.labels_font_size;
        grafico.y_title = this.line_y_title;
        grafico.colors = [this.line_color];
        grafico.y_ticks = 5;
        grafico.criar();

        this.grafico_linha = grafico;
    }

    criar(){
        this.svg = d3.select('#'+this.element_id);
        this.criarBarras();
        this.criarLinha();
    }


    /**
     * Ação do mouseover na linha
     */
    overBars(){
        this.grafico_barras.overBars();
    }

    /**
     * Ação do mouseout na linha
     */
    outBars(){
        this.grafico_barras.outBars();
    }

    overLine(line){
        this.grafico_linha.overLine(line);
    }

    outLine(line){
        this.grafico_linha.outLine(line);
    }
}