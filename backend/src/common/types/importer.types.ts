/** Column name plus optional import column flags from the frontend parser. */
export type ImporterColumnTuple = [
  string,
  { overwrite?: boolean; onlyUpdateNulls?: boolean; isCustom?: boolean },
];
