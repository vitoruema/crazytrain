/*
* Create a table containing the data that will be used to plot the chart.
*/

/* Crazy train considerando quilometragens */

/*
* Extrai os nomes e as rotas dos trens do texto de entrada e armazena
* estas informa??es numa lista de trens.
*/
function parseTrains(input) {
    var trains = new Array();
    var segment = new Array();
    var kilometragem = new Array();



    // Cria os padr?es para detectar trens e pontos
    var trainPattern = /T[0-9]+/;
    var pointPattern = /[A-Z]+_[0-9]+ ; [0-9]+-[0-9]+-[0-9]+ [0-9]+:[0-9]+:[0-9]+\.[0-9]+ ; [0-9]+\.[0-9]+/;
    var segmentPattern = /[A-Z]+ ; [0-9]+\.[0-9]+/;

    // Quebra o input em linhas.
    var lines = input.split("\n");
    // Para cada linha,
    for (var i = 0; i < lines.length; i++) {

        var trainMatch = trainPattern.exec(lines[i]);
        var pointMatch = pointPattern.exec(lines[i]);
        var segmentMatch = segmentPattern.exec(lines[i]);
        // Se a linha cont?m o nome de um trem
        if (trainMatch) {
            // Extrai o nome do trem
            trainName = trainMatch[0];
            // Adiciona o trem a lista de trens
            train = {name: trainName, route: new Array()}
            trains.push(train);
        }
        // Se a linha contem informa??o de um ponto
        else if (pointMatch) {
            var pointSplit = pointMatch[0].split(" ; ")
            var track = pointSplit[0];
            var date = pointSplit[1];
            var dist = pointSplit[2];
            // Cria um par com identifica??o da via e da hora e adiciona ?s
            // informa??es do trem
            train.route.push({date: date, track: track, dist: dist, pos: 0})
        }
        else if (segmentMatch) {
            var segmentSplit = segmentMatch[0].split(" ; ");
            var name = segmentSplit[0];
            var len = eval(segmentSplit[1]);

            if (i != 0)
                kilometragem.push({name:name, len: kilometragem[i - 1].len + len});
            else
                kilometragem.push({name:name, len:len});

            segment.push({name:name, len: len});
        }
        else
            throw "erro na linha " + (i + 1);
    }

    calcPosition(trains, arrayListToAssociativeArray(kilometragem), segment);

    return [trains, kilometragem];
}

/* calcula a posicao do trem a partir do inicio do segmento A
 * posicao eh calculada somando as distancias percorridas pelo trem */
function calcPosition(trains, kilometragem, segment) {
    for (var i = 0; i < trains.length; i++) {
        var trainRoute = trains[i].route;

        /* posicao inicial do trem */
        trainRoute[0].pos = kilometragem[trainRoute[0].track[0]];

        /* trem indo no sentido AB */
         if (trainRoute[0].track < trainRoute[trainRoute.length - 1].track) {
            trainRoute[0].pos = trainRoute[0].pos - findSegmentLen(trainRoute[0].track[0], segment);
            for (var j = 1; j < trainRoute.length - 1; j++) {
                /* trem esta parado se o trem nao mudou de segmento e nao avancou para o fim do segmento */
                if (trainRoute[j].track == trainRoute[j - 1].track && trainRoute[j].dist == trainRoute[j - 1].dist) {
                    trainRoute[j].pos = trainRoute[j - 1].pos;
                }
                else {
                    /* mudou de segmento */
                    if (trainRoute[j].track != trainRoute[j - 1].track)
                        trainRoute[j].pos = kilometragem[trainRoute[j - 1].track[0]];
                    /* avancou ate o fim do segmento */
                    else
                        trainRoute[j].pos = kilometragem[findNextSegmentAB(trainRoute[j - 1].track[0], segment)];
                }
            }
            /* posicao final do trem */
            trainRoute[j].pos = trainRoute[j - 1].pos + findSegmentLen(trainRoute[j - 1].track[0], segment);
         }
         /* trem indo no sentido BA */
         else {
            for (var j = 1; j < trainRoute.length - 1; j++) {
                /* trem esta parado se o trem nao mudou de segmento e nao avancou para o fim do segmento */
                if (trainRoute[j].track == trainRoute[j - 1].track && trainRoute[j].dist == trainRoute[j - 1].dist) {
                    trainRoute[j].pos = trainRoute[j - 1].pos;
                }
                else {
                    /* mudou de segmento */
                    if (trainRoute[j].track != trainRoute[j - 1].track)
                        trainRoute[j].pos = kilometragem[trainRoute[j].track[0]];
                    /* avancou ate o fim do segmento */
                    else
                        trainRoute[j].pos = kilometragem[findNextSegmentBA(trainRoute[j].track[0], segment)];
                }
            }
            /* posicao final do trem */
            trainRoute[j].pos = trainRoute[j - 1].pos - findSegmentLen(trainRoute[j - 1].track[0], segment);
         }
    }
}

///////////////////////////////////////////////////////
// funcoes auxiliares para o calculo da posicao do trem
//////////////////////////////////////////////////////

/* transforma um array de associative arrays em um unico associative array */
function arrayListToAssociativeArray(segment) {
    var resp = {};

    for (var i = 0; i < segment.length; i++)
        resp[segment[i].name] = segment[i].len;

    return resp;
}

/* encontra o comprimento do segmento */
function findSegmentLen (track, segment) {
    for (var i = 0; i < segment.length; i++) {
        if (track == segment[i].name)
            return segment[i].len;
    }
    return null;
}

/* encontra o proximo segmento considerando o sentido AB */
function findNextSegmentAB (track, segment) {
    for (var i = 0; i < segment.length - 1; i++) {
        if (track == segment[i].name)
        return segment[i].name;
    }
    return null;
}

/* encontra o proximo segmento considerando o sentido BA */
function findNextSegmentBA (track, segment) {
    for (var i = 0; i < segment.length - 1; i++) {
        if (track == segment[i].name)
        return segment[i - 1].name;
    }
    return null;
}


///////////////////////////////
// funcoes para desenhar o grafico
///////////////////////////////
function createDataTable(trains) {
    var data = new google.visualization.DataTable();
    // A primeira coluna ? referente ao hor?rio dos pontos da rota do trem

    data.addColumn('datetime', 'Horario'); // Implicit domain column
    // As colunas seguintes s?o referentes a cada trem

    for (var i = 0; i < trains.length; i++) {
        // Assume que os trens nas linhas v?o estar na mesma ordem
        data.addColumn('number', trains[i].name); // Implicit data column.
    }

    // Adiciona as linhas contendo os hor?rios e as vias dos trens para
    // estes hor?rios, caso existam

    var rows = trainPointsToRows(trains);

    for (var i = 0; i < rows.length; i++) {
        data.addRow(rows[i]);
    }

    return data;
}

function setOptions(segments) {
    var options = {
        width: 800,
        height: 600,
        interpolateNulls: true,
        pointSize: 2,
        vAxes: {
            0: {title: 'Sentido AB', ticks : distToViaAB(segments)},
            1: {title: 'Sentido BA', ticks : distToViaBA(segments)}},
        series: {
            0: {targetAxisIndex: 0},
            1: {targetAxisIndex: 1}}
    };
    return options;
}

/* setar o label de cada kilometragem sentido AB
 * exemplo: kilometro: 30, label: via C */
function distToViaAB(segments) {
    var vAxisLabels = new Array();
    vAxisLabels.push({v: 0, f: segments[0].name});
    for (var i = 1; i < segments.length; i++) {
        vAxisLabels.push({v: segments[i - 1].len, f: segments[i].name});
    }
    vAxisLabels.push({v: segments[i - 1].len, f: segments[i - 1].name});

    return vAxisLabels;
}
/* setar o label de cada kilometragem sentido BA
 * exemplo: kilometro: 30, label: via D */
function distToViaBA(segments) {
    var vAxisLabels = new Array();
    vAxisLabels.push({v: 0, f: segments[0].name});
    for (var i = 0; i < segments.length; i++) {
        vAxisLabels.push({v: segments[i].len, f: segments[i].name});
    }
    return vAxisLabels;
}

/* para cada horario marcar onde os trens estao */
function trainsToTrainsInfo(trains, dates) {
    var trainsInfo = {};

    // Para cada trem
    for (var i = 0; i < trains.length; i++) {
        var trainRoute = trains[i].route;
        var trainName = trains[i].name;
        // Inicia a tabela de informa??es do trem
        trainsInfo[trainName] = {};
        // Para cada ponto na rota do trem
        for (var j = 0; j < trainRoute.length; j++) {
            var date = trainRoute[j].date;
            var pos = trainRoute[j].pos;
            var track = trainRoute[j].track;
            // Adiciona o hor?rio do ponto ? lista de datas se ele
            // n?o estiver contido na lista
            if (dates.indexOf(date) == -1) {
                dates.push(date);
            }

            // Associa a ocupa??o da via a um hor?rio espec?fico para cada trem
            trainsInfo[trainName][date] = {pos: pos, track: track};
        }
    }
    return trainsInfo;
}

function trainPointsToRows(trains) {
    var dates = new Array();
    var trainsInfo = trainsToTrainsInfo(trains, dates);

    dates.sort();
    var rows = new Array();
    // Para cada data
    for (var i = 0; i < dates.length; i++) {
        var date = dates[i];
        // Cria uma linha na tabela de dados
        rows[i] = new Array();
        // Com a primeira coluna correspondente ? data
        rows[i].push(new Date(date));
        // E as colunas restantes correspondentes a cada trem
        for (var j = 0; j < trains.length; j++) {
            var train = trains[j];
            var route = trainsInfo[train.name][date];
            // Onde a coluna cont?m a informa??o da via, se o trem
            // tiver um ponto composto por esta data e esta via
            if (route != null) {
                rows[i].push({v:route["pos"], f:route["track"]});
            }
            // Ou null, caso o ponto n?o exista
            else {
                rows[i].push(null);
            }
        }
    }
    return rows;
}