(async function () {
    var url = window.location.href;
    // aprender3 action
    if (url.includes("aprender3.unb.br/course/view.php?id=")) {
        var contents = window.document.body.innerHTML;
        var pattern = /sesskey=([\w-]{10})/i;
        var results = contents.match(pattern);
        if (results) {
            let sesskey = results[1];
            var p = new Promise(function(resolve, reject){
                chrome.storage.sync.get("sesskey_store", function(data){
                    resolve(data.sesskey_store);
                })
            });
            const sesskey_store = await p;
            if (sesskey_store != sesskey){
                chrome.storage.sync.set({'sesskey_store':sesskey});
                window.location.replace(url+"&sesskey="+sesskey+"&edit=on");
            }
        }
        return;
    }
    // sigaa action
    if (window.location.href.includes("sig.unb.br/sigaa/ava")) {
        var contents = window.document.body.innerHTML;
        var divelem = window.document.getElementById('divEmails');
        if (divelem != null) {
            var pattern = /Matr.+cula: <em>\s*(?<mat>\d{9})\s*</gi;
            var results = contents.matchAll(pattern);
            divelem.innerHTML = "emails<br>";
            for (let result of results) {
                let {all, mat} = result.groups;
                let email = mat+"@aluno.unb.br<br>";
                divelem.innerHTML += email;
            }
            divelem.innerHTML += "<br>";
            divelem.style.display = "block";
        }
    }
})();

