// To parse this data:
//
//   import { Convert, SLOCResponse } from "./file";
//
//   const sLOCResponse = Convert.toSLOCResponse(json);

export interface SLOCResponse {
  files: File[]
  summary: Summary
  byExt: ByEXT
}

export interface ByEXT {
  ts: Ts
  tsx: Ts
}

export interface Ts {
  files: File[]
  summary: Summary
}

export interface File {
  path: string
  stats: Summary
  badFile: boolean
}

export interface Summary {
  total: number
  source: number
  comment: number
  single: number
  block: number
  mixed: number
  empty: number
  todo: number
  blockEmpty: number
}

// Converts JSON strings to/from your types
export class Convert {
  public static toSLOCResponse(json: string): SLOCResponse {
    return JSON.parse(json)
  }

  public static sLOCResponseToJson(value: SLOCResponse): string {
    return JSON.stringify(value)
  }
}
