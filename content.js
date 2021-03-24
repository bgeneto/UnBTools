const isFirefox = navigator.userAgent.match(/(?:firefox|fxios)\/(\d+)/) !== null;
const url = window.location.href;
const content = window.document.body.innerHTML;
const mapaDias = {
    2: 'SEG',
    3: 'TER',
    4: 'QUA',
    5: 'QUI',
    6: 'SEX',
    7: 'SAB'
}
const mapaHorarios = {
    'M1': {inicio: '08:00', fim: '08:55'},
    'M2': {inicio: '08:55', fim: '09:50'},
    'M3': {inicio: '10:00', fim: '10:55'},
    'M4': {inicio: '10:55', fim: '11:50'},
    'M5': {inicio: '12:00', fim: '12:55'},
    'T1': {inicio: '12:55', fim: '13:50'},
    'T2': {inicio: '14:00', fim: '14:55'},
    'T3': {inicio: '14:55', fim: '15:50'},
    'T4': {inicio: '16:00', fim: '16:55'},
    'T5': {inicio: '16:55', fim: '17:50'},
    'T6': {inicio: '18:00', fim: '18:55'},
    'T7': {inicio: '18:55', fim: '19:50'},
    'N1': {inicio: '19:00', fim: '19:50'},
    'N2': {inicio: '19:50', fim: '20:40'},
    'N3': {inicio: '20:50', fim: '21:40'},
    'N4': {inicio: '21:40', fim: '22:30'}
}
const padraoSigaa = /\b([2-7]{1,5})([MTN])([1-7]{1,7})\b/gm;
/** Objeto TreeWalker que permite navegar por todos os campos de texto da página.
 * Neste, caso possui um filtro (3º argumento) que só permite textos (nós) que se encaixem no padrão SIGAA.
*/
const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {acceptNode: (node) => padraoSigaa.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP},
    false
);

/**
 * Função que separa os dias para que toda "palavra" de horário tenha só 1 dígito de dia antes do turno.
 * ex: 246M12 vira 2M12 4M12 6M12.
 *
 * Quando já está devidamente separado, retorna o mesmo texto.
 *
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o(s) dígito(s) do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 * @author Luthiery Costa
 */
function separaDias(match, g1, g2, g3) {
    return [...g1].map(dia => `${dia}${g2}${g3}`).join(' ');
}


/**
 * Função que recebe o texto com os horários e o ordena pela ordem dos dias da semana
 * Ou seja, o primeiro dígito de cada "palavra".
 *
 * @param {*} texto     O texto HTML dos horários separados por espaço, que já foi tratado pela separaDias().
 * @returns O texto com os horários ordenados separados por espaço.
 * @author Luthiery Costa
 */
function ordenaDias(texto) {
    return [...texto.matchAll(padraoSigaa)]
        .sort((a,b) => a[1] < b[1] ? -1 :
                       a[1] > b[1] ? 1 : 0)
        .map(a => a[0])
        .join(' ');
}


/**
 * Função que recebe o horário do SIGAA e retorna o texto traduzido através do dicionário acima
 *
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o dígito do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 * @author Luthiery Costa
 */
function mapeiaHorarios(match, g1, g2, g3) {
    let dia         = mapaDias[g1];
    let hora_inicio = mapaHorarios[`${g2}${g3.charAt(0)}`].inicio;
    let hora_fim    = mapaHorarios[`${g2}${g3.charAt(g3.length-1)}`].fim;
    return `${dia} ${hora_inicio}-${hora_fim}`;
}


function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function reload(obj, sesskey, data) {
    if (data.sesskey_store != sesskey) {
        obj.storage.local.set({'sesskey_store':sesskey});
        window.location.replace(url+"&sesskey="+sesskey+"&edit=on");
    }
}

function aprender3() {
    let pattern = /sesskey=([\w-]{10})/i;
    let results = content.match(pattern);
    if (results) {
        let sesskey_store;
        let sesskey = results[1];
        let obj = isFirefox ? browser : chrome;
        let gettingItem = new Promise(resolve => obj.storage.local.get("sesskey_store", resolve));
        gettingItem.then(function(data) { return reload(obj,sesskey,data); }, null);
    }
}


function sigaa() {
    // e-mails
    let divelem = window.document.getElementById('divEmails');
    if (typeof divelem !== 'undefined' && divelem !== null) {
        let pattern = /Matr.+cula: <em>\s*(?<mat>\d{9})\s*</gi;
        let results = content.matchAll(pattern);
        let inHTML = '<div align="center" style="color: blue;font-weight:bold;">'
            + 'Lista de e-mails INSTITUCIONAIS dos discentes</div><br><div id="divEmails2" align="center"'
            + 'style="border: 1px solid;"><br>emails<br>';
        for (let result of results) {
            let {all, mat} = result.groups;
            let email = mat+"@aluno.unb.br<br>";
            inHTML += email;
        }
        inHTML += "<br></div>";
        let newdiv = document.createElement("div");
        insertAfter(divelem, newdiv);
        newdiv.innerHTML = inHTML;
        newdiv.style.display = "block";
    }

    // Horários: procura por todos os textos e, onde reconhecer o padrão de horário, executa a substituição
    let node;
    while(node = treeWalker.nextNode()){
        node.textContent = node.textContent.replace(padraoSigaa,separaDias);
        node.textContent = ordenaDias(node.textContent);
        node.textContent = node.textContent.replace(padraoSigaa,mapeiaHorarios);
        // por fim, junta as ocorrências 12:00-12:55/12:55-13:50 em simplesmente 12:00-13:50
        node.textContent = node.textContent.replace(/([A-Z]{3}) 12:00-12:55 ([A-Z]{3}) 12:55-13:50/gm, '$1 12:00-13:50')
    }
}


(function () {
    // aprender3 action
    if (url.includes("aprender3.unb.br/course/view.php?id=")) {
        aprender3();
    // sigaa action
    } else if (url.includes("sig.unb.br/sigaa/")) {
        sigaa();
    }
})();
