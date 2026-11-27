// SLIDES ARRASTÁVEIS
// Vale para a página inicial (.dropslider) e para a página de produto (.slider)

// Distância mínima (em px) para considerar que o usuário está arrastando
const LIMITE_ARRASTO = 5;

function iniciarSlider(slider) {

    let pressionado = false;   // mouse/dedo está pressionado
    let arrastando = false;    // passou do limite e está arrastando de fato
    let houveArrasto = false;  // usado para bloquear o clique no link após arrastar
    let inicioX = 0;
    let scrollInicial = 0;
    let ponteiroId = null;

    // Impede o arrasto nativo de imagens e links
    slider.addEventListener("dragstart", (evento) => {
        evento.preventDefault();
    });

    // Inicia o possível arraste
    slider.addEventListener("pointerdown", (evento) => {

        if (evento.pointerType === "mouse" && evento.button !== 0) {
            return;
        }

        // Botões continuam funcionando normalmente (links podem arrastar)
        if (evento.target.closest("button")) {
            return;
        }

        pressionado = true;
        arrastando = false;
        houveArrasto = false;
        ponteiroId = evento.pointerId;
        inicioX = evento.clientX;
        scrollInicial = slider.scrollLeft;
    });

    // Movimenta o slider
    slider.addEventListener("pointermove", (evento) => {

        if (!pressionado || evento.pointerId !== ponteiroId) {
            return;
        }

        const distancia = evento.clientX - inicioX;

        // Só começa a arrastar depois de mover o suficiente
        if (!arrastando) {

            if (Math.abs(distancia) < LIMITE_ARRASTO) {
                return;
            }

            arrastando = true;
            houveArrasto = true;

            slider.classList.add("arrastando");
            slider.setPointerCapture(evento.pointerId);
        }

        slider.scrollLeft = scrollInicial - distancia;
    });

    // Finaliza o arraste
    function pararArrasto(evento) {

        if (evento && evento.pointerId !== ponteiroId) {
            return;
        }

        pressionado = false;
        arrastando = false;
        ponteiroId = null;

        slider.classList.remove("arrastando");
    }

    slider.addEventListener("pointerup", pararArrasto);
    slider.addEventListener("pointercancel", pararArrasto);
    slider.addEventListener("lostpointercapture", pararArrasto);

    // Se arrastou, cancela o clique no link (para não abrir o produto sem querer)
    slider.addEventListener("click", (evento) => {

        if (houveArrasto) {
            evento.preventDefault();
            evento.stopPropagation();
            houveArrasto = false;
        }

    }, true);
}

// PÁGINA INICIAL: sliders do drop atual
document.querySelectorAll(".dropslider").forEach(iniciarSlider);

// PÁGINA DE PRODUTO: sliders de outros produtos
document.querySelectorAll(".slider").forEach(iniciarSlider);