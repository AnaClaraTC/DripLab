/* =====================================================
   DRIP LAB - countdown.js (relógio do próximo drop)

   Conta regressiva para as 20:00 (8h da noite) do dia.
   - Se já passou das 20h, marca o próximo dia (20h de amanhã).
   - Atualiza a cada segundo.
   - Funciona na página inicial (#destaque #tempo) e
     na página da loja (#conttempodrop #tempo).
   ===================================================== */

(function () {
    "use strict";

    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function getNextDrop() {
        var agora = new Date();
        var alvo = new Date(agora);

        // Alvo: hoje às 20:00:00
        alvo.setHours(20, 0, 0, 0);

        // Se já passou das 20h, o próximo drop é amanhã
        if (agora >= alvo) {
            alvo.setDate(alvo.getDate() + 1);
        }

        return alvo;
    }

    function atualizarRelogio() {
        var agora = new Date();
        var alvo = getNextDrop();
        var diff = alvo - agora; // milissegundos restantes

        if (diff <= 0) {
            diff = 0;
        }

        var totalSegundos = Math.floor(diff / 1000);
        var horas = Math.floor(totalSegundos / 3600);
        var minutos = Math.floor((totalSegundos % 3600) / 60);
        var segundos = totalSegundos % 60;

        // Encontra todos os contêineres #tempo na página
        var tempos = document.querySelectorAll("#tempo");

        tempos.forEach(function (tempo) {
            var spans = tempo.querySelectorAll("span");

            // Estrutura esperada: span(horas) span(:) span(minutos) span(:) span(segundos)
            if (spans.length >= 5) {
                spans[0].textContent = pad(horas);
                spans[2].textContent = pad(minutos);
                spans[4].textContent = pad(segundos);
            }
        });

        // Atualiza as legendas também (HORAS / MIN / SEG)
        var legendas = document.querySelectorAll("#legendas");
        legendas.forEach(function (legenda) {
            var spans = legenda.querySelectorAll("span");
            if (spans.length >= 3) {
                spans[0].textContent = "HORAS";
                spans[1].textContent = "MIN";
                spans[2].textContent = "SEG";
            }
        });
    }

    // Roda assim que o DOM estiver pronto
    document.addEventListener("DOMContentLoaded", function () {
        atualizarRelogio();
        setInterval(atualizarRelogio, 1000);
    });
})();
