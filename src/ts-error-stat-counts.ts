import _ from "lodash"
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

export class TsErrorStats {
  public fileStats: { [index: string]: ErrFileStats }

  constructor() {
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
