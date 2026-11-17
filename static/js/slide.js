function iniciarSlider(slider) {

    let pressionado = false;
    let arrastando = false;
    let houveArrasto = false;
    let inicioX = 0;
    let scrollInicial = 0;
    let ponteiroId = null;

    slider.addEventListener("dragstart", (evento) => {
        evento.preventDefault();
    });

    slider.addEventListener("pointerdown", (evento) => {

        if (evento.pointerType === "mouse" && evento.button !== 0) {
            return;
        }

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

    slider.addEventListener("pointermove", (evento) => {

        if (!pressionado || evento.pointerId !== ponteiroId) {
            return;
        }

        const distancia = evento.clientX - inicioX;

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

    slider.addEventListener("click", (evento) => {

        if (houveArrasto) {
            evento.preventDefault();
            evento.stopPropagation();
            houveArrasto = false;
        }

    }, true);
}

document.querySelectorAll(".dropslider").forEach(iniciarSlider);
document.querySelectorAll(".slider").forEach(iniciarSlider);