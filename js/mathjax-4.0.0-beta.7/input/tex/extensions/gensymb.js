(()=>{"use strict";var e={d:(t,a)=>{for(var n in a)e.o(a,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:a[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{GensymbConfiguration:()=>l});const a=("undefined"!=typeof window?window:global).MathJax._.components.global,n=(a.GLOBAL,a.isObject,a.combineConfig,a.combineDefaults,a.combineWithMathJax),o=(a.MathJax,MathJax._.input.tex.HandlerTypes),r=o.ConfigurationType,i=o.HandlerType,s=MathJax._.input.tex.Configuration,p=s.Configuration,c=(s.ConfigurationHandler,s.ParserConfiguration,MathJax._.input.tex.TexConstants.TexConstant),b=MathJax._.input.tex.TokenMap,u=(b.parseResult,b.AbstractTokenMap,b.RegExpMap,b.AbstractParseMap,b.CharacterMap);b.DelimiterMap,b.MacroMap,b.CommandMap,b.EnvironmentMap;new u("gensymb-symbols",(function(e,t){const a=t.attributes||{};a.mathvariant=c.Variant.NORMAL,a.class="MathML-Unit";const n=e.create("token","mi",a,t.char);e.Push(n)}),{ohm:"\u2126",degree:"\xb0",celsius:"\u2103",perthousand:"\u2030",micro:"\xb5"});const l=p.create("gensymb",{[r.HANDLER]:{[i.MACRO]:["gensymb-symbols"]}});MathJax.loader&&MathJax.loader.checkVersion("[tex]/gensymb","4.0.0-beta.7","tex-extension"),n({_:{input:{tex:{gensymb:{GensymbConfiguration:t}}}}})})();