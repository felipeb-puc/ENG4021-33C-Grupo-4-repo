// Menu do perfil: abre ao passar o mouse na bolinha do perfil e também com um clique (no celular não existe "passar o mouse").
const perfil = document.getElementById("perfil");

if (perfil) {
    const botao = document.getElementById("botao-perfil");
    const menu = document.getElementById("menu-perfil");
    let espera;

    function abrirMenu() {
        clearTimeout(espera);
        menu.classList.add("aberto");
        botao.setAttribute("aria-expanded", "true");
    }

    function fecharMenu() {
        menu.classList.remove("aberto");
        botao.setAttribute("aria-expanded", "false");
    }

    // pointerType "mouse" separa o mouse do toque na tela; no toque quem abre é o clique
    perfil.addEventListener("pointerenter", function (evento) {
        if (evento.pointerType === "mouse") {
            abrirMenu();
        }
    });

    // espera um pouco antes de fechar, para dar tempo de levar o mouse até o menu
    perfil.addEventListener("pointerleave", function (evento) {
        if (evento.pointerType === "mouse") {
            espera = setTimeout(fecharMenu, 250);
        }
    });

    // o clique só abre: se fechasse, quem passa o mouse (que já abre o menu) e depois clica fecharia sem querer
    botao.addEventListener("click", function () {
        abrirMenu();
    });

    // clicar fora do menu (no celular, tocar fora) ou apertar Esc fecha
    document.addEventListener("click", function (evento) {
        if (!perfil.contains(evento.target)) {
            fecharMenu();
        }
    });

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            fecharMenu();
        }
    });
}
