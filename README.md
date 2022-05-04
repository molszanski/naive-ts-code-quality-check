# Naive Typescript Code Quality Checker

Checks ts and tsx fils

```
npm install -g naive-ts-code-quality-check

# print stats in a `src` folder
> ntcqc

# print stats from a specific folder
> ntcqc -p folder/src

# print stats from a fancy header
> ntcqc -p folder/src -t CustomHeader
```

```bash
> npx naive-ts-code-quality-check@latest -p project/folder/src


---------- Summary ------------

       All Issues : 294
  Issues Per Line : 0.444 %
             SLOC : 66 225

-------------------------------


Name         Occurance  Files  Per Souce Line of Code %
-----------  ---------  -----  ------------------------
tsIgnore     113        113    0.171 %
any          38         38     0.057 %
asAny        8          8      0.012 %
orUndefined  135        135    0.204 %
```

**check for 4 types of greppable possible issiues**

| Issue Type  | Description                             |
| ----------- | --------------------------------------- |
| tsIgnore    | `// @ts-ignore` usage should be avoided |
| any         | `let a: any` usage should ba avoided    |
| asAny       | `let a = a() as any as SomeInterface `  |
| orUndefined | `private user: User \| undefind`        |

You can always check exact greps in [source](https://github.com/molszanski/naive-ts-code-quality-check/blob/main/src/index.ts#L40):

```ts
{
  tsIgnore: grep("@ts-ignore"),
  any: grep(": any"),
  asAny: grep("as any"),
  orUndefind: grep("| undefined")
}

```

```bash
> naive-ts-code-quality-check -h

Usage: naive-ts-code-quality-check [options]

Options:
  -p, --path     path to analyze
  -t, --title    Title name to use
  -d, --details  report stats of each analyzed file
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]

Examples:
  naive-ts-code-quality-check               check default folder stats
  naive-ts-code-quality-check -p            check folder project/src
  project/src
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

# profile
yarn build && DEBUG="*"  node lib/index.js
```
