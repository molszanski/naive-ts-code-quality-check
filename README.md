# Naive Typescript Code Quality Checker

Checks ts and tsx fils

```bash
> npx naive-ts-code-quality-check -p project/folder/src
> naive-ts-code-check -p project/folder/src

---------- Result ------------

  @ts-ignore errors : 9
              files : 4
         any errors : 10
              files : 4
      as Any errors : 0
              files : 0
       or undefined : 0
              files : 0
          All Files : 4

------------------------------
```

## Dev

install this package global
`yarn global add "file:$PWD"`
https://stackoverflow.com/questions/70566220/how-to-use-yarn-to-install-a-local-package-globally

```bash

# dev
nodemon src/index.ts

# check cli
yarn build && node ./lib/index.js -p src/test
yarn build && node ./lib/index.js -p src/test --details
```
