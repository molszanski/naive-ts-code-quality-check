import _ from "lodash"
import { SLOCResponse } from "./sloc.types"
var EasyTable = require("easy-table")
var table = require("text-table")

interface ErrStats {
  [index: string]: { name: string; errOccurance: number }
}

type ErrNames = "tsIgnore" | "any" | "asAny" | "orUndefined"
type ErrTotalStatsKeys = ErrNames | `${ErrNames}Files`
type TotalResults = {
  [stat in ErrTotalStatsKeys]: number
}
type ErrFileStats = {
  [stat in ErrNames]: number
}

type ErrConfig = {
  [stat in ErrNames]: any
}
const ErrorRuntimeConfig: ErrConfig = Object.freeze({
  tsIgnore: true,
  any: true,
  asAny: true,
  orUndefined: true,
} as const)

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]
function ObjectEntries<T>(obj: T): Entries<T> {
  return Object.entries(obj) as any
}
const fmt = (n: number) => Math.round(n * 100 * 100) / 100
export class TsErrorStats {
  public fileStats: {
    [index: string]: ErrFileStats
  }

  constructor(private slocStats: SLOCResponse, private title: string) {
    this.fileStats = {}
  }

  public updateErrType(err: ErrStats, errName: keyof ErrFileStats) {
    for (const [key, val] of Object.entries(err)) {
      if (val.errOccurance > 0) {
        const e = this.getEntry(key)
        e[errName] = val.errOccurance
      }
    }
  }

  public countTotal(): TotalResults {
    const ttl: TotalResults = {
      tsIgnore: 0,
      tsIgnoreFiles: 0,
      any: 0,
      anyFiles: 0,
      asAny: 0,
      asAnyFiles: 0,
      orUndefined: 0,
      orUndefinedFiles: 0,
    }
    for (const [fName, fStats] of ObjectEntries(this.fileStats)) {
      for (const [errName] of ObjectEntries(ErrorRuntimeConfig)) {
        if (fStats[errName] > 0) {
          ttl[errName] += fStats[errName]
          ttl[`${errName}Files`]++
        }
      }
    }

    return ttl
  }

  public countSummary() {
    const totals = this.countTotal()
    const summary = {
      sloc: this.slocStats.summary.source,
      allIssues: 0,
      issuesPerSloc: 0,
    }

    for (const [errName] of ObjectEntries(ErrorRuntimeConfig)) {
      summary.allIssues += totals[errName]
    }
    summary.issuesPerSloc = fmt(summary.allIssues / summary.sloc)

    // summary.sloc =  1

    return summary
  }

  public printStats(opts: { details?: boolean }) {
    const ttl = this.countTotal()
    console.log("\n---------- Result ------------\n")

    var t = table(
      [
        ["  @ts-ignore errors ", ttl.tsIgnore],
        ["  files ", ttl.tsIgnoreFiles],
        ["  any errors ", ttl.any],
        ["  files ", ttl.anyFiles],
        ["  as Any errors ", ttl.asAny],
        ["  files ", ttl.asAnyFiles],
        ["  or undefined ", ttl.orUndefined],
        ["  files ", ttl.orUndefinedFiles],
        ["  All Files ", Object.keys(this.fileStats).length],
      ],
      { align: ["r", "l"], hsep: ": " },
    )
    console.log(t)

    console.log("\n------------------------------\n")
    if (opts.details) {
      console.table(this.fileStats)
    }
  }

  public printStats2(opts: { details?: boolean }) {
    // SUMMARY PRINT
    this.printSummary()
    this.printIssueDetails()

    if (opts.details) {
      console.table(this.fileStats)
    }
  }

  public printSummary() {
    const summ = this.countSummary()
    if (this.title !== "") {
      console.log(`\n---------- ${this.title} Summary ------------\n`)
    } else {
      console.log(`\n---------- Summary ------------\n`)
    }

    var t = table(
      [
        ["  All Issues ", summ.allIssues],
        ["  Issues Per Line ", summ.issuesPerSloc.toString() + " %"],
        ["  SLOC ", summ.sloc],
      ],
      { align: ["r", "l"], hsep: ": " },
    )
    console.log(t)

    console.log("\n" + "-".repeat(32 + this.title.length))
  }

  public printIssueDetails() {
    const ttl = this.countTotal()
    console.log("\n")

    const sloc = this.slocStats.summary.source
    var t = new EasyTable()
    for (const [errName] of ObjectEntries(ErrorRuntimeConfig)) {
      const occ = ttl[errName]
      const files = ttl[errName]
      const perSloc = fmt(occ / sloc)

      t.cell("Name", errName)
      t.cell("Occurance", occ)
      t.cell("Files", files)
      t.cell("Per Souce Line of Code %", perSloc.toString() + " %")

      t.newRow()
    }
    console.log(t.toString())
  }

  private getEntry(fPath: string): ErrFileStats {
    if (this.fileStats[fPath] == null) {
      this.fileStats[fPath] = {
        tsIgnore: 0,
        any: 0,
        asAny: 0,
        orUndefined: 0,
      }
    }
    return this.fileStats[fPath]
  }
}
