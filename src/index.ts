import path from "path"
import util from "util"
import shell from "shelljs"
import { TsErrorStats } from "./ts-error-stat-counts"

import yargs from "yargs/yargs"
import { __importDefault } from "tslib"

const argv: any = yargs(process.argv.slice(2))
  // .usage("Usage: $0 <command> [options]")
  .usage("Usage: $0 [options]")
  .example("$0", "check default folder stats")
  .example("$0 -p project/src", "check folder project/src")
  .alias("v", "version")
  .alias("p", "path")
  .describe("p", "path to analyze")
  .alias("d", "details")
  .describe("d", "report stats of each analyzed file")
  // .demandOption(["p"])
  .help("h")
  .alias("h", "help").argv

const pathArg = argv.path ?? "src"
const pathToProcess = path.resolve(process.cwd(), pathArg)
const shouldShowDetails = argv.details === true

interface ErrStats {
  [index: string]: { name: string; errOccurance: number }
}

function execFind(grep: string) {
  return `find ${pathArg} -type f -iname "*.ts*" -print0 | xargs -0 grep -c "${grep}"`
}

const greps = {
  tsIgnore: execFind("@ts-ignore"),
  any: execFind(": any"),
  asAny: execFind("as any"),
  orUndefind: execFind("| undefined"),
}

const asyncShell = util.promisify(shell.exec)

async function getParsedLines(grepLine: string): Promise<ErrStats> {
  try {
    const linesOut = await asyncShell(grepLine, { silent: true })
    return parseLines(linesOut)
  } catch (grepErrCode) {
    // means no errors
    if (grepErrCode == 1) {
      return {}
    }
    throw grepErrCode
  }
}

export async function doWork() {
  try {
    const star = new TsErrorStats()

    const tsIgnoreLines = await getParsedLines(greps.tsIgnore)
    const anyLines = await getParsedLines(greps.any)
    const asAny = await getParsedLines(greps.asAny)
    const orUndef = await getParsedLines(greps.orUndefind)

    star.updateErrType(tsIgnoreLines, "tsIgnore")
    star.updateErrType(anyLines, "any")
    star.updateErrType(asAny, "asAny")
    star.updateErrType(orUndef, "orUndefined")

    star.printStats({ details: shouldShowDetails })
  } catch (e) {
    console.log("something is wrong")
    console.log("path might not be correct")
    console.log("Processing folder: ", pathToProcess)
    console.log(e)
  }
}

function parseLines(lines: string): ErrStats {
  const x: ErrStats = {}
  const linesParsed = lines.split(/\r?\n/)

  linesParsed.forEach((line) => {
    if (line.includes(":") === true) {
      const [name, count] = line.split(":")
      x[name] = { name: name, errOccurance: parseInt(count) }
    }
  })

  return x
}

doWork()
