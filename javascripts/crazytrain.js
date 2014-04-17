        /*
         * Create a table containing the data that will be used to plot the chart.
         */
        function createDataTable(trains, startTime) {
                var data = new google.visualization.DataTable();
                // A primeira coluna ? referente ao hor?rio dos pontos da rota
                // do trem
                data.addColumn('datetime', 'Horario'); // Implicit domain column
                // As colunas seguintes s?o referentes a cada trem
                for (var i = 0; i < trains.length; i++) {
                        // Assume que os trens nas linhas v?o estar na mesma ordem
                        data.addColumn('number', trains[i].name); // Implicit data column.
                }
                // Adiciona as linhas contendo os hor?rios e as vias dos trens para
                // estes hor?rios, caso existam
                var rows = trainPointsToRows(trains, startTime);
                for (var i = 0; i < rows.length; i++) {
                        rows[i];
                        data.addRow(rows[i]);
                }
                return data;
        }
        
        /*
         * Verifica se o sentido do trem ? invertido.
         */
        function trainPointsToRows(trains, startTime) {
                var dates = new Array();
                var segments = new Array();
                var trainsInfo = {};
                // Para cada trem
                for (var i = 0; i < trains.length; i++) {
                        var trainRoute = trains[i].route;
                        var trainName = trains[i].name;
                        // Inicia a tabela de informações do trem
                        trainsInfo[trainName] = {};
                        // Para cada ponto na rota do trem
                        for (var j = 0; j < trainRoute.length; j++) {
                                var date = trainRoute[j].date;
                                var track = trainRoute[j].track;
                                // Adiciona o hor?rio do ponto ? lista de datas se ele
                                // n?o estiver contido na lista
                                if (dates.indexOf(date) == -1) {
                                        dates.push(date);
                                }
                                var segment = segmentFromTrack(track);
                                // Adiciona o segmento referente ? via deste ponto ? lista
                                // de segmentos caso ele n?o esteja contido na lista
                                if (segments.indexOf(segment) == -1) {
                                        segments.push(segment);
                                }
                                // Associa a ocupa??o da via a um hor?rio espec?fico para
                                // cada trem
                                trainsInfo[trainName][date] = track;
                        }
                }
                // Ordena os segmentos e as datas. Note que o algoritmo presume que
                // os segmentos est?o nomeados e ordenados em ordem alfab?tica. Assim,
                // a representa??o das rotas n?o ser? fiel caso este n?o seja o caso.
                segments.sort();
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
                                var track = trainsInfo[train.name][date];
                                // Onde a coluna cont?m a informa??o da via, se o trem
                                // tiver um ponto composto por esta data e esta via
                                if (track) {
                                        var segmentNumber = segments.indexOf(segmentFromTrack(track));
                                        if (isReversed(train, segments)) {
                                                segmentNumber += 1;
                                        }
                                        rows[i].push({v: segmentNumber, f: track});
                                }
                                // Ou null, caso o ponto n?o exista
                                else {
                                        rows[i].push(null);
                                }
                        }
                }
                // Adiciona o horário inicial, caso exista
                if (startTime) {
                        var startTimeRow = rows.length;
                        rows[startTimeRow] = new Array();
                        rows[startTimeRow].push(new Date(startTime));
                        for (var segmentNumber = 0; segmentNumber < segments.length; segmentNumber++) {
                                rows[startTimeRow].push({v: segmentNumber, f: ""})
                        }
                }
                return rows;
        }
        
        /*
         * Retorna o segmento referente ? via passada como argumento.
         */
        function segmentFromTrack(track) {
                return track.split("_")[0];
        }
        
        /*
         * Extrai os nomes e as rotas dos trens do texto de entrada e armazena
         * estas informa??es numa lista de trens.
         */
        function parseTrains(input) {
                var trains = new Array();
                // Cria os padr?es para detectar trens e pontos
                var trainPattern = /T[0-9]+/i;
                var pointPattern = /[A-Z]_[0-9]+ ; .*/i
                // Quebra o input em linhas.
                var lines = input.split("\n");
                // Para cada linha,
                for (var i = 0; i < lines.length; i++) {
                        var trainMatch = trainPattern.exec(lines[i]);
                        var pointMatch = pointPattern.exec(lines[i]);
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
                                // Cria um par com identifica??o da via e da hora e adiciona ?s
                                // informa??es do trem
                                train.route.push({date: date, track: track})
                        }
                }
                return trains;
        }
        
        /*
         * Faz o parsing do horário inicial de planejamento
         */
        function parseStartTime(input) {
                var startTimeStepPattern = /(Given o horario de inicio de planejamento eh igual a .*)/i
                var datePattern = /\d+-\d+-\d+\s\d+:\d+:\d+.\d+/i
                var lines = input.split("\n")
                var startTimeStepMatch;
                for (var i = 0; i < lines.length; i++) {
                        startTimeStepMatch = startTimeStepPattern.exec(lines[i]);
                }
                var startTime;
                if (startTimeStepMatch) {
                        var startTimeStep = startTimeStepMatch[0];
                        var dateMatch = datePattern.exec(startTimeStep);
                        if (dateMatch) {
                                startTime = dateMatch[0];   
                        }
                }
                return startTime;
        }
        
        /*
         * Verifica se o sentido do trem ? invertido.
         */
        function isReversed(train, segments) {
                // O sentido do trem ? invertido se o ?ndice do primeiro segmento do
                // percurso do trem ? maior que o ?ndice do ?ltimo segmento
                return (segments.indexOf(segmentFromTrack(train.route[0].track)) >
                                segments.indexOf(segmentFromTrack(train.route[train.route.length - 1].track)))
        }
