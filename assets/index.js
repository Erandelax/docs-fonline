var syntaxTypes = [
    "int8","int16","int32","int","int64","uint8","uint16","uint","uint32","uint64","float","float64","double","resource","hash"
];

require(
    "https://use.fontawesome.com/releases/v5.6.1/css/all.css",
    "https://fonts.googleapis.com/css?family=Ubuntu+Mono",
    "docs.yaml"
).then(function(yaml){
    console.log(yaml)
    
    var style = document.createElement("style")
    var filterDom = document.createElement("style")
    var filter = {
        map: true,
        server: true,
        client: true
    }
    function filterUpdate(){
        var css = ""
        css += "." + Object.keys(filter).join(",.")+"{display:none}\n"
        for (var i in filter) if (typeof filter[i] === "boolean" && filter[i]) {
            css += "."+i+"{display:block}";
        }
        filterDom.innerHTML = css
    }
    style.innerHTML = ""
    
    // Languages support
    var langs = (yaml.langs !== undefined && typeof yaml.langs === "object") ? yaml.langs : ['en']
    var lang  = (navigator !== undefined && navigator.language !== undefined) ? navigator.language.split("-")[0] : "en"
    document.getElementsByTagName("html")[0].setAttribute("lang",lang)
    style.innerHTML += "div[lang]:not(:only-of-type){display:none}"
    langs.forEach(function(lang){ style.innerHTML += "html[lang='" + lang + "'] [lang='" + lang + "']{ display:block!important }" })
    
    document.body.classList.add("markdown-body")
    
    function format(data){
        return yaml.replace[data] ? yaml.replace[data] : data
    }
    
    function domScope(scope) {
        var el = document.createElement("span")
        el.classList.add("fa")
        switch(scope.toLowerCase()){
            case "server":
                el.classList.add("fa-server")
                el.title = "SERVER"
                break
            case "client":
                el.classList.add("fa-desktop")
                el.title = "CLIENT"
                break
            case "mapper":
                el.classList.add("fa-globe")
                el.title = "MAPPER"
                break
        }
        return el
    }

    function render(parent, data, depth = 1) {
        if (data === undefined) return
        
        var element = document.createElement("div")
        element.classList.add("element")
        
        // Fill element
        if (data.name) {
            element.setAttribute("data-name", format(data.name) )
        }
        
        var meta = document.createElement("div")
        meta.classList.add("meta")
        if (data.type) {
            element.setAttribute("data-type", format(data.type) )
            
            var type = document.createElement("span")
            type.innerText = format( data.type )
            meta.appendChild(type)
        }
        if (data.scope) {
            data.scope = format(data.scope)
            if (typeof data.scope === "string") {
                element.classList.add(data.scope)
                
                meta.appendChild(domScope(data.scope))
                
            } else for (var i in data.scope) if (data.scope.hasOwnProperty(i)) {
                element.classList.add(format(data.scope[i]))
                
                meta.appendChild(domScope(data.scope[i]))
            }
        }
        
        element.appendChild(meta)
        
        
        if (data.script) {
            var pre = document.createElement("pre")
            if(data.source) pre.setAttribute("data-source",data.source)
            pre.classList.add("prettyprint")
            pre.classList.add('lang-cpp')
            pre.innerHTML = format( data.script )
            element.appendChild(pre)
            //hljs.highlightBlock(pre);
            
        } else if (data.name) { // Missing code, show header
            var header = document.createElement("div")
            header.classList.add("header")
            header.innerHTML = data.name
            element.appendChild(header)
        }
        for (var i in langs) if( data[langs[i]] !== undefined ) {
            var desc = document.createElement("div")
            desc.setAttribute("lang",langs[i])
            desc.innerText = format( data[langs[i]] )
            element.appendChild(desc)
        } 
        
        
        // Render element
        parent.appendChild(element)
        
        // Render children
        if (data._ !== undefined) 
            for (var i in data._) 
                if (data._.hasOwnProperty(i) && typeof data._[i] === "object")
                    render(element, data._[i], depth + 1)
    }
    
    for (var i in yaml.api) if (yaml.api.hasOwnProperty(i) && typeof yaml.api[i] === "object") {
        render(document.getElementById("document"), yaml.api[i])
    }
    
    document.addEventListener("click",function(e){
        if (e.target.classList.contains("typ") || e.target.classList.contains("pln")) {
            e.preventDefault()
            var name = e.target.innerHTML.replace(/[\@\[\]\+]/g,"")
            document.querySelectorAll('[data-name="'+name+'"]').forEach(function(element){
                window.scroll(0,element.offsetTop)
                element.classList.add("goto")
                setTimeout(function(){
                    element.classList.remove("goto")
                },1000)
            })
        }
    })
    
    document.body.appendChild(style)
    document.body.appendChild(filterDom)
    
    // Navbar composition
    var navbar = document.getElementById("navbar")
    function domNavFilterFn(e){
        filter[e.target.value] = e.target.checked 
        filterUpdate()
    }
    function domNavFilter(options){
        var cont = document.createElement("div")
        for (var i in options) if (options.hasOwnProperty(i)) {
            var item = document.createElement("input")
            item.type = "checkbox"
            item.value = options[i]
            item.title = i
            item.checked = true
            item.onchange = domNavFilterFn
            cont.appendChild(item)
        }
        return cont
    }
    navbar.appendChild( domNavFilter({
        "Server":"server",
        "Client":"client",
        "Map":"map"
    }) )
    
    // Completion
    require("https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js").then(function(){
        require("assets/index.css").then(function(){
            
            setTimeout(function(){ // Angelscript fixes
                document.querySelectorAll(".kwd").forEach(function(el){
                    if (el.innerHTML == "const") el.classList.add("cst")
                })
                document.querySelectorAll(".typ").forEach(function(el){
                    if (syntaxTypes.indexOf(el.innerText) !== -1) {
                        el.classList.add("kwd")
                        el.classList.remove("typ")
                    }
                })
                document.querySelectorAll(".com").forEach(function(el){
                    if (el.innerHTML.trim().startsWith("#")) {
                        el.classList.add("cmp")
                        el.classList.remove("com")
                    }
                })
                document.getElementById("spinner").remove()
            },1)
        })
    })

})
