/**
 * @license
 * jsonv 0.0.1
 */
; (function (window) {
    // 版本
    var VERSION = '0.0.1'
    const STYLE = `body{background-color:#fff;padding-left:28px;padding-top:6px;line-height:1.5;color:#444;font-family:monospace;}.entry{display:block;padding-left:20px;margin-left:-20px;position:relative;font-size:13px;}.collapsed{white-space:nowrap;}.collapsed>.blockInner{display:none;}.collapsed>.ell:after{content:'…';font-weight:bold;}.collapsed>.ell{margin:0 4px;color:#888;}.collapsed .entry{display:inline;}.entry:after{content:attr(data-size);color:#aaa;}.e{width:20px;height:18px;display:block;position:absolute;left:0px;top:1px;color:black;z-index:5;background-repeat:no-repeat;background-position:center center;display:flex;align-items:center;justify-content:center;opacity:0.15;}.e::after{content:'';display:block;width:0;height:0;border-style:solid;border-width:4px 0 4px 6.9px;border-color:transparent transparent transparent currentColor;transform:rotate(90deg) translateY(1px);}.collapsed>.e::after{transform:none;}.e:hover{opacity:0.35;}.e:active{opacity:0.5;}.collapsed .entry .e{display:none;}.blockInner{display:block;padding-left:24px;border-left:1px dotted #bbb;margin-left:2px;}a:link,a:visited,a:hover,a:active{text-decoration:underline;color:inherit;}.b{font-weight:bold;}.s{color:#0b7500;word-wrap:break-word;}.n{color:#05059c;font-weight:bold;}.bl,.nl{color:#cd0707;font-weight:bold;}span{white-space:pre-wrap;}`
    // 类型枚举
    const TYPE_STRING = 1
    const TYPE_NUMBER = 2
    const TYPE_OBJECT = 3
    const TYPE_ARRAY = 4
    const TYPE_BOOL = 5
    const TYPE_NULL = 6
    // 模板配置
    const templates = {
        t_entry: genSpanDom("entry"),
        t_exp: genSpanDom("e"),
        t_key: genSpanDom("k"),
        t_string: genSpanDom("s"),
        t_number: genSpanDom("n"),
        t_null: genSpanDom("nl", "null"),
        t_true: genSpanDom("bl", "true"),
        t_false: genSpanDom("bl", "false",),
        t_oBrace: genSpanDom("b", "{"),
        t_cBrace: genSpanDom("b", "}"),
        t_oBracket: genSpanDom("b", "["),
        t_cBracket: genSpanDom("b", "]"),
        t_sizeComment: genSpanDom("sizeComment"),
        t_ellipsis: genSpanDom("ell"),
        t_blockInner: genSpanDom("blockInner"),
        t_colonAndSpace: document.createTextNode(":\xA0"),
        t_commaText: document.createTextNode(","),
        t_dblqText: document.createTextNode('"')
    }
    // sort 排序
    function sort(obj) {
        if (obj === null) {
            return null
        }
        if (Array.isArray(obj)) {
            return obj.map(item => sort(item))
        }
        if (typeof obj === 'object') {
            const sortedObj = {}
            Object.keys(obj).sort().forEach(key => {
                sortedObj[key] = sort(obj[key])
            });
            return sortedObj
        }
        return obj
    }
    // parse 解析变量值类型
    function parse(value) {
        if (typeof value === "string") {
            return TYPE_STRING
        }
        if (typeof value === "number") {
            return TYPE_NUMBER
        }
        if (value === false || value === true) {
            return TYPE_BOOL
        }
        if (value === null) {
            return TYPE_NULL
        }
        if (Array.isArray(value)) {
            return TYPE_ARRAY
        }
        return TYPE_OBJECT
    }
    // genSpanDom 生成 span 节点
    function genSpanDom(className = '', innerText = '') {
        let span = document.createElement('span')
        span.className = className
        span.innerText = innerText
        return span
    }
    // buildTree ...
    function buildTree(value, keyName) {
        const type = parse(value)
        const entry = templates.t_entry.cloneNode(false)
        let collectionSize = 0
        if (type === TYPE_OBJECT) {
            collectionSize = Object.keys(value).length
        } else if (type === TYPE_ARRAY) {
            collectionSize = value.length
        }
        let nonZeroSize = false
        if (type === TYPE_OBJECT || type === TYPE_ARRAY) {
            for (const objKey in value) {
                if (value.hasOwnProperty(objKey)) {
                    nonZeroSize = true
                    break
                }
            }
            if (nonZeroSize) {
                entry.appendChild(templates.t_exp.cloneNode(false))
            }
        }
        if (keyName !== false) {
            entry.classList.add("objProp")
            const keySpan = templates.t_key.cloneNode(false)
            keySpan.textContent = JSON.stringify(keyName).slice(1, -1)
            entry.appendChild(templates.t_dblqText.cloneNode(false))
            entry.appendChild(keySpan)
            entry.appendChild(templates.t_dblqText.cloneNode(false))
            entry.appendChild(templates.t_colonAndSpace.cloneNode(false))
        } else {
            entry.classList.add("arrElem")
        }
        let blockInner
        let childEntry
        switch (type) {
            case TYPE_STRING: {
                const innerStringEl = genSpanDom()
                let escapedString = JSON.stringify(value)
                escapedString = escapedString.substring(1, escapedString.length - 1)
                if (value.substring(0, 8) === "https://" || value.substring(0, 7) === "http://") {
                    const innerStringA = document.createElement("a")
                    innerStringA.href = value
                    innerStringA.innerText = escapedString
                    innerStringEl.appendChild(innerStringA)
                } else {
                    innerStringEl.innerText = escapedString
                }
                const valueElement = templates.t_string.cloneNode(false)
                valueElement.appendChild(templates.t_dblqText.cloneNode(false))
                valueElement.appendChild(innerStringEl)
                valueElement.appendChild(templates.t_dblqText.cloneNode(false))
                entry.appendChild(valueElement)
                break
            }
            case TYPE_NUMBER: {
                const valueElement = templates.t_number.cloneNode(
                    false
                )
                valueElement.innerText = String(value)
                entry.appendChild(valueElement)
                break
            }
            case TYPE_OBJECT: {
                entry.appendChild(templates.t_oBrace.cloneNode(true))
                if (nonZeroSize) {
                    entry.appendChild(templates.t_ellipsis.cloneNode(false))
                    blockInner = templates.t_blockInner.cloneNode(false)
                    let lastComma
                    for (let k in value) {
                        if (value.hasOwnProperty(k)) {
                            childEntry = buildTree(value[k], k)
                            const comma = templates.t_commaText.cloneNode()
                            childEntry.appendChild(comma)
                            blockInner.appendChild(childEntry)
                            lastComma = comma
                        }
                    }
                    childEntry.removeChild(lastComma)
                    entry.appendChild(blockInner)
                }
                entry.appendChild(templates.t_cBrace.cloneNode(true))
                entry.dataset.size = ` // ${collectionSize} ${collectionSize === 1 ? "key" : "keys"}`
                break
            }
            case TYPE_ARRAY: {
                entry.appendChild(templates.t_oBracket.cloneNode(true))
                if (nonZeroSize) {
                    entry.appendChild(templates.t_ellipsis.cloneNode(false))
                    blockInner = templates.t_blockInner.cloneNode(false)
                    for (let i = 0, length = value.length, lastIndex = length - 1; i < length; i++) {
                        childEntry = buildTree(value[i], false)
                        if (i < lastIndex) {
                            const comma = templates.t_commaText.cloneNode()
                            childEntry.appendChild(comma)
                        }
                        blockInner.appendChild(childEntry)
                    }
                    entry.appendChild(blockInner)
                }
                entry.appendChild(templates.t_cBracket.cloneNode(true))
                entry.dataset.size = ` // ${collectionSize} ${collectionSize === 1 ? "item" : "items"}`
                break
            }
            case TYPE_BOOL: {
                if (value)
                    entry.appendChild(templates.t_true.cloneNode(true))
                else
                    entry.appendChild(templates.t_false.cloneNode(true))
                break
            }
            case TYPE_NULL: {
                entry.appendChild(templates.t_null.cloneNode(true))
                break
            }
        }
        return entry
    }
    // injectListener ...
    function injectListener() {
        document.querySelector('body').addEventListener('click', function (event) {
            if (event.target.matches('span.e')) {
                event.target.parentNode.classList.toggle('collapsed');
            }
        })
    }
    // injectCSS ...
    function injectCSS() {
        document.querySelectorAll('link[rel="stylesheet"], style').forEach(element => {
            element.remove()
        })
        const styleElement = document.createElement('style')
        styleElement.textContent = STYLE
        document.head.appendChild(styleElement)
    }
    class jsonv {
        VERSION = VERSION
        Draw(content) {
            document.addEventListener('DOMContentLoaded', () => {
                try {
                    let value = JSON.parse(content)
                    if (typeof value !== "object" && !Array.isArray(value)) {
                        throw new Error(`JSON is not Object or Array`)
                    }
                    document.querySelector('body').appendChild(buildTree(sort(value), false))
                    injectListener(), injectCSS()
                } catch (e) {
                    document.querySelector('body').appendChild(genSpanDom('', `Parse JSON error: ${e}`))
                }
            })
        }
    }
    window.jsonv = window.jsonv || new jsonv()
}(window));