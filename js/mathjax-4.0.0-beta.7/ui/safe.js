(()=>{"use strict";var t={d:(e,s)=>{for(var i in s)t.o(s,i)&&!t.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:s[i]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{SafeMethods:()=>c});var s={};t.r(s),t.d(s,{Safe:()=>p});var i={};t.r(i),t.d(i,{SafeHandler:()=>d,SafeMathDocumentMixin:()=>h});const a=("undefined"!=typeof window?window:global).MathJax._.components.global,r=(a.GLOBAL,a.isObject,a.combineConfig,a.combineDefaults,a.combineWithMathJax),o=(a.MathJax,MathJax._.util.Options),l=(o.isObject,o.APPEND,o.REMOVE,o.OPTIONS,o.Expandable,o.expandable),n=(o.makeArray,o.keys,o.copy,o.insert,o.defaultOptions,o.userOptions,o.selectOptions,o.selectOptionsFromKeys,o.separateOptions,o.lookup,MathJax._.util.lengths),f=(n.BIGDIMEN,n.UNITS,n.RELUNITS,n.MATHSPACE,n.length2em),c=(n.percent,n.em,n.px,{filterURL(t,e){const s=(e.match(/^\s*([a-z\n\r]+):/i)||[null,""])[1].replace(/[\n\r]/g,"").toLowerCase(),i=t.allow.URLs;return"all"===i||"safe"===i&&(t.options.safeProtocols[s]||!s)?e:null},filterClassList(t,e){return e.trim().replace(/\s\s+/g," ").split(/ /).map((e=>this.filterClass(t,e)||"")).join(" ").trim().replace(/\s\s+/g,"")},filterClass(t,e){const s=t.allow.classes;return"all"===s||"safe"===s&&e.match(t.options.classPattern)?e:null},filterID(t,e){const s=t.allow.cssIDs;return"all"===s||"safe"===s&&e.match(t.options.idPattern)?e:null},filterStyles(t,e){if("all"===t.allow.styles)return e;if("safe"!==t.allow.styles)return null;const s=t.adaptor,i=t.options;try{const a=s.node("div",{style:e}),r=s.node("div");for(const e of Object.keys(i.safeStyles))if(i.styleParts[e])for(const i of["Top","Right","Bottom","Left"]){const o=e+i,l=this.filterStyle(t,o,a);l&&s.setStyle(r,o,l)}else{const i=this.filterStyle(t,e,a);i&&s.setStyle(r,e,i)}e=s.allStyles(r)}catch(t){e=""}return e},filterStyle(t,e,s){const i=t.adaptor.getStyle(s,e);if("string"!=typeof i||""===i||i.match(/^\s*calc/)||i.match(/javascript:/)&&!t.options.safeProtocols.javascript||i.match(/data:/)&&!t.options.safeProtocols.data)return null;const a=e.replace(/Top|Right|Left|Bottom/,"");return t.options.safeStyles[e]||t.options.safeStyles[a]?this.filterStyleValue(t,e,i,s):null},filterStyleValue(t,e,s,i){const a=t.options.styleLengths[e];if(!a)return s;if("string"!=typeof a)return this.filterStyleLength(t,e,s);const r=this.filterStyleLength(t,a,t.adaptor.getStyle(i,a));return r?(t.adaptor.setStyle(i,a,r),t.adaptor.getStyle(i,e)):null},filterStyleLength(t,e,s){if(!s.match(/^(.+)(em|ex|ch|rem|px|mm|cm|in|pt|pc|%)$/))return null;const i=f(s,1),a=t.options.styleLengths[e],[r,o]=Array.isArray(a)?a:[-t.options.lengthMax,t.options.lengthMax];return r<=i&&i<=o?s:(i<r?r:o).toFixed(3).replace(/\.?0+$/,"")+"em"},filterFontSize(t,e){return this.filterStyleLength(t,"fontSize",e)},filterSizeMultiplier(t,e){const[s,i]=t.options.scriptsizemultiplierRange||[-1/0,1/0];return Math.min(i,Math.max(s,parseFloat(e))).toString()},filterScriptLevel(t,e){const[s,i]=t.options.scriptlevelRange||[-1/0,1/0];return Math.min(i,Math.max(s,parseInt(e))).toString()},filterData:(t,e,s)=>s.match(t.options.dataPattern)?e:null});class p{constructor(t,e){this.filterAttributes=new Map([["href","filterURL"],["src","filterURL"],["altimg","filterURL"],["class","filterClassList"],["style","filterStyles"],["id","filterID"],["fontsize","filterFontSize"],["mathsize","filterFontSize"],["scriptminsize","filterFontSize"],["scriptsizemultiplier","filterSizeMultiplier"],["scriptlevel","filterScriptLevel"],["data-","filterData"]]),this.filterMethods=Object.assign({},c),this.adaptor=t.adaptor,this.options=e,this.allow=this.options.allow}sanitize(t,e){try{t.root.walkTree(this.sanitizeNode.bind(this))}catch(s){e.options.compileError(e,t,s)}}sanitizeNode(t){const e=t.attributes.getAllAttributes();for(const t of Object.keys(e)){const s=this.filterAttributes.get(t);if(s){const i=this.filterMethods[s](this,e[t]);i?i!==("number"==typeof i?parseFloat(e[t]):e[t])&&(e[t]=i):delete e[t]}}}mmlAttribute(t,e){if("class"===t)return null;const s=this.filterAttributes.get(t)||("data-"===t.substring(0,5)?this.filterAttributes.get("data-"):null);if(!s)return e;const i=this.filterMethods[s](this,e,t);return"number"==typeof i||"boolean"==typeof i?String(i):i}mmlClassList(t){return t.map((t=>this.filterMethods.filterClass(this,t))).filter((t=>null!==t))}}function h(t){var e;return(e=class extends t{constructor(...t){super(...t),this.safe=new this.options.SafeClass(this,this.options.safeOptions);for(const t of this.inputJax)t.name.match(/MathML/)?(t.mathml.filterAttribute=this.safe.mmlAttribute.bind(this.safe),t.mathml.filterClassList=this.safe.mmlClassList.bind(this.safe)):t.name.match(/TeX/)&&t.postFilters.add(this.sanitize.bind(t),-5.5)}sanitize(t){t.math.root=this.parseOptions.root,t.document.safe.sanitize(t.math,t.document)}}).OPTIONS=Object.assign(Object.assign({},t.OPTIONS),{safeOptions:Object.assign({},p.OPTIONS),SafeClass:p}),e}function d(t){return t.documentClass=h(t.documentClass),t}p.OPTIONS={allow:{URLs:"safe",classes:"safe",cssIDs:"safe",styles:"safe"},lengthMax:3,scriptsizemultiplierRange:[.6,1],scriptlevelRange:[-2,2],classPattern:/^mjx-[-a-zA-Z0-9_.]+$/,idPattern:/^mjx-[-a-zA-Z0-9_.]+$/,dataPattern:/^data-mjx-/,safeProtocols:l({http:!0,https:!0,file:!0,javascript:!1,data:!1}),safeStyles:l({color:!0,backgroundColor:!0,border:!0,cursor:!0,margin:!0,padding:!0,textShadow:!0,fontFamily:!0,fontSize:!0,fontStyle:!0,fontWeight:!0,opacity:!0,outline:!0}),styleParts:l({border:!0,padding:!0,margin:!0,outline:!0}),styleLengths:l({borderTop:"borderTopWidth",borderRight:"borderRightWidth",borderBottom:"borderBottomWidth",borderLeft:"borderLeftWidth",paddingTop:!0,paddingRight:!0,paddingBottom:!0,paddingLeft:!0,marginTop:!0,marginRight:!0,marginBottom:!0,marginLeft:!0,outlineTop:!0,outlineRight:!0,outlineBottom:!0,outlineLeft:!0,fontSize:[.707,1.44]})},MathJax.loader&&MathJax.loader.checkVersion("ui/safe","4.0.0-beta.7","ui"),r({_:{ui:{safe:{SafeHandler:i,SafeMethods:e,safe:s}}}}),MathJax.startup&&MathJax.startup.extendHandler((t=>d(t)))})();