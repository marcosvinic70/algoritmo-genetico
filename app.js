(function($) {
    var modulo = angular.module('appModule', ['ui.bootstrap', 'chart.js']);

    modulo.controller('AppCtrl', function($scope) {
        
        $scope.taxaDeCrossover = 60;
        $scope.taxaDeMutacao = 1;
        $scope.maxDeGeracoes = 5;
        $scope.tamanhoPopulacao = 4;
        $scope.geracoesFinal = [];
        var qtGeracoes = 0;

        $scope.algoritmoGenetico = function algoritmoGenetico() {
            
            $scope.geracoesFinal = [];
            var qtGeracoes = 0;
            var geracoes = [];
            var geracao = gerarPopulacaoInicial();
            geracoes.push(geracao);

            do {

                var pais = torneio(geracoes[qtGeracoes].populacao);
                var filhos = gerarNovaPopulacao(pais);
                var novaGeracao = criarNovaGeracao(filhos);
                geracoes.push(novaGeracao);

            } while (criterioDeParada() == false);
            
            $scope.geracoesFinal = geracoes;
            
            function Individuo(x) {
                this.cromossomo = getCromossomo(x);
                this.decimal = x;
                this.aptidao = calculaFuncao(this.decimal);
            }

            function Geracao(idGeracao, populacao) {
                this.idGeracao = idGeracao;
                this.populacao = populacao;
            }

            function getNumRandom() {
                return Math.floor((Math.random() * (-10 - 10) + 10));
            }

            function calculaFuncao(x) {
                 return ((Math.pow(x,2)) + (- 3 * x) + 4);
            }

            function gerarPopulacaoInicial() {  

                var geracao, numAleatorio, populacao = [];

                for (var i=0; i < $scope.tamanhoPopulacao; i++) {
                    do {
                    numAleatorio = getNumRandom();
                    } while(populacao.indexOf(numAleatorio) > -1);
                
                    populacao.push(new Individuo(numAleatorio));
                }
                
                geracao = new Geracao(qtGeracoes, populacao);

                return geracao;

            }

            function getCromossomo(num) {
                var str = num.toString(2);
                if (str.charAt(0) == "-") {
                    var sinalNegativo = str.charAt(0);
                    return sinalNegativo + '000'.slice(0, 4 - (str.length - 1)) + str.slice(1, str.length);
                } else {
                    return '0000'.slice(0, 5 - str.length) + str;
                }
            }

            function copiarPopulacao(populacao) {
                return populacao.slice(0);
            }

            function torneio(populacao) {
                var pais = [];
                var pop = copiarPopulacao(populacao);

                for(var i = 0; i < 2; i++) {
                    var selecionados = []; 
                    do {
                        var numAleatorio1 = Math.floor(Math.random() * ($scope.tamanhoPopulacao - i)); 
                        var numAleatorio2 = Math.floor(Math.random() * ($scope.tamanhoPopulacao - i));
                    } while(numAleatorio1 == numAleatorio2);

                    selecionados.push(pop[numAleatorio1]);
                    selecionados.push(pop[numAleatorio2]);

                    if (selecionados[0].aptidao <= selecionados[1].aptidao) {
                    
                        pais.push(selecionados[0]);
                        pop.splice(numAleatorio1, 1);

                    } else {
                    
                        pais.push(selecionados[1]);
                        pop.splice(numAleatorio2, 1);
                    }
                    
                }

                return pais;

            }

            function crossover(pais) {
                var filhos = [];
                var pai = pais[0].cromossomo;
                var mae = pais[1].cromossomo;
                var ptDeCorte = 0; 

                for(var i = 0; i < $scope.tamanhoPopulacao / 2; i++) {
                    var aux = [], verifica = 0;
                    
                    if (Math.random() <= $scope.taxaDeCrossover / 100) {
                        do {

                            if (i != 0) {
                                 aux = cruzar(mae, pai, ptDeCorte);
                            } else {
                                aux = cruzar(pai, mae, ptDeCorte);
                            }

                            verifica++;
                        } while (verificaDecimal(aux) == false && verifica < 100);
                    
                        if (verifica < 100) {
                            aux.forEach((filho) => {
                                filhos.push(filho);
                            });
                            continue;
                        }
                     } 
                    
                filhos.push(pais[0]);
                filhos.push(pais[1]);
                
                }
                return filhos;
            }
            
            function cruzar(pai, mae, ptDeCorte) {
                var cromossomos = [];
                var filhos = [];
                
                do {
                    var pontoDeCorte = Math.floor((pai.length - 2) * Math.random()) + 2;
                } while (pontoDeCorte == ptDeCorte);
                ptDeCorte = pontoDeCorte;
                
                cromossomos[0] = pai.slice(0,1) + pai.slice(1, pontoDeCorte);
                cromossomos[0] += mae.slice(pontoDeCorte, mae.length);
                filhos.push(new Individuo(parseInt(cromossomos[0],2)));
                    
                cromossomos[1] = mae.slice(0,1) + mae.slice(1, pontoDeCorte);
                cromossomos[1] += pai.slice(pontoDeCorte, pai.length);
                filhos.push(new Individuo(parseInt(cromossomos[1], 2)));
                
                return filhos;
            }

            function verificaDecimal(filhos) {
                var aux = true;
                for(var i = 0; i < filhos.length; i++) {
                    if(filhos[i].decimal > 10 || filhos[i].decimal < -10) {
                        aux = false;
                    }
                }
                return aux;
            }

            function mutacao(filhos) {
                var filhosMutados = [];
                
                for(var i = 0; i < filhos.length; i++) {
                    filhos[i].cromossomo = filhos[i].cromossomo.split("");
                    
                    for(var j=1; j < filhos[i].cromossomo.length; j++) {
                      if (Math.random() <= $scope.taxaDeMutacao / 100) { 
                        
                        if (j > 1 && parseInt(filhos[i].cromossomo.join(""), 2) < 8
                          && parseInt(filhos[i].cromossomo.join(""), 2) > -8) {
                        
                          if (filhos[i].cromossomo[j] == "1") {
                            filhos[i].cromossomo[j] = "0";
                          } else if (filhos[i].cromossomo[j] == "0") {
                            filhos[i].cromossomo[j] = "1";
                          }
                        } else if (parseInt(filhos[i].cromossomo.join(""), 2) < 3
                        && parseInt(filhos[i].cromossomo.join(""), 2) > -3) {
                        filhos[i].cromossomo[j] = "1";
                        }
                      }
                    }
                
                    filhos[i].cromossomo = filhos[i].cromossomo.join("");
                    filhos[i].decimal = parseInt(filhos[i].cromossomo, 2);
                    filhos[i].aptidao = calculaFuncao(filhos[i].decimal);
                    filhosMutados.push(filhos[i]);
                }
                return filhosMutados;
            }

            function gerarNovaPopulacao(pais) { 
                var crossoverFilhos = crossover(pais);
                return mutacao(crossoverFilhos);
            }

            function criarNovaGeracao(filhos) {
                var geracao, populacao = [];
                
                for (var i = 0; i < filhos.length; i++) {
                    populacao.push(filhos[i]);
                }
                
                geracao = new Geracao(++qtGeracoes, populacao);
                return geracao;
            }

            function criterioDeParada() {
                if (qtGeracoes == $scope.maxDeGeracoes - 1) {
                    return true;
                }
                return false;
            }
        };
    });
})();
