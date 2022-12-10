# reveal.js
wget https://github.com/hakimel/reveal.js/archive/master.zip
unzip master.zip
mv reveal.js-master revealjs

# d3
wget https://registry.npmjs.org/d3/-/d3-7.7.0.tgz
tar -xzf d3-7.7.0.tgz -C js --strip-components=2 package/dist/d3.min.js

# jQuery
wget -P js https://code.jquery.com/jquery-3.6.1.min.js

