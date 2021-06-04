# token-proposal

See [documentation on Confluence](https://confluence-eng-gpk2.cisco.com/conf/display/~pauwitty/Token+proposal)

To generate a flat token file for a particular theme, run:
```
node theme_generator.js <theme file>
```
e.g.
```
node theme_generator.js ./themes/theme-light-webex.json
```
It supports some options
```
Usage: /home/paul/token-proposal/theme_generator.js [OPTION]... [THEME FILE]...
Options
  --colorFormat=[hex|rgba]    What color format to use in the output.
       rgba -> rgba(244,233,20,0.8)
       hex  -> #RRGGBBAA (or would be if someone fixes it)
  --platform=PLATFORM         Which platform to generate for.
```
