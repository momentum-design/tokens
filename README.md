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
       rgba   -> rgba(244,233,20,0.8)
       object -> { "r": 244, "g": 233, "b": 20, "a": 0.8 }
       hex    -> #RRGGBBAA
       names  -> red-05
  --sizeUnit=[px|pt|rem]      What unit to use for sizes in the output.
       px    -> pixels (matching that on Figma)
       pt    -> points (pixels * 0.75)
       rem   -> root em, used on web to create sizes relative to user font size
  --componentGroups           Group tokens by component
  --omitThemeTokens           Removes theme tokens from the generated file
  --fileFormat=[css|json]     What format to use for the output files
  --platform=PLATFORM         Which platform to generate for.
       web
       qt
       macos
       ios
       android
  --toStdOut                  Output to std out instead of writing to files

```
Tokens for individual components go in the components folder. If components are needed on only one platform, they should go in e.g. platformcomponents/ios/component_name.json. It's also possible to add platformcomponents/mobile/component_name.json which applies on both ios and android, or platformcomponents/desktop/component_name.json, for both macos and qt.
