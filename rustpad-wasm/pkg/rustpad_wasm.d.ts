/* tslint:disable */
/* eslint-disable */
/**
* Set a panic listener to display better error messages.
*/
export function set_panic_hook(): void;
/**
* This is an wrapper around `operational_transform::OperationSeq`, which is
* necessary for Wasm compatibility through `wasm-bindgen`.
*/
export class OpSeq {
  free(): void;
/**
* Creates a default empty `OpSeq`.
* @returns {OpSeq}
*/
  static new(): OpSeq;
/**
* Creates a store for operatations which does not need to allocate  until
* `capacity` operations have been stored inside.
* @param {number} capacity
* @returns {OpSeq}
*/
  static with_capacity(capacity: number): OpSeq;
/**
* Merges the operation with `other` into one operation while preserving
* the changes of both. Or, in other words, for each input string S and a
* pair of consecutive operations A and B.
*     `apply(apply(S, A), B) = apply(S, compose(A, B))`
* must hold.
*
* # Error
*
* Returns `None` if the operations are not composable due to length
* conflicts.
* @param {OpSeq} other
* @returns {OpSeq | undefined}
*/
  compose(other: OpSeq): OpSeq | undefined;
/**
* Deletes `n` characters at the current cursor position.
* @param {number} n
*/
  delete(n: number): void;
/**
* Inserts a `s` at the current cursor position.
* @param {string} s
*/
  insert(s: string): void;
/**
* Moves the cursor `n` characters forwards.
* @param {number} n
*/
  retain(n: number): void;
/**
* Transforms two operations A and B that happened concurrently and produces
* two operations A' and B' (in an array) such that
*     `apply(apply(S, A), B') = apply(apply(S, B), A')`.
* This function is the heart of OT.
*
* # Error
*
* Returns `None` if the operations cannot be transformed due to
* length conflicts.
* @param {OpSeq} other
* @returns {OpSeqPair | undefined}
*/
  transform(other: OpSeq): OpSeqPair | undefined;
/**
* Applies an operation to a string, returning a new string.
*
* # Error
*
* Returns an error if the operation cannot be applied due to length
* conflicts.
* @param {string} s
* @returns {string | undefined}
*/
  apply(s: string): string | undefined;
/**
* Computes the inverse of an operation. The inverse of an operation is the
* operation that reverts the effects of the operation, e.g. when you have
* an operation 'insert("hello "); skip(6);' then the inverse is
* 'delete("hello "); skip(6);'. The inverse should be used for
* implementing undo.
* @param {string} s
* @returns {OpSeq}
*/
  invert(s: string): OpSeq;
/**
* Checks if this operation has no effect.
* @returns {boolean}
*/
  is_noop(): boolean;
/**
* Returns the length of a string these operations can be applied to
* @returns {number}
*/
  base_len(): number;
/**
* Returns the length of the resulting string after the operations have
* been applied.
* @returns {number}
*/
  target_len(): number;
/**
* Return the new index of a position in the string.
* @param {number} position
* @returns {number}
*/
  transform_index(position: number): number;
/**
* Attempts to deserialize an `OpSeq` from a JSON string.
* @param {string} s
* @returns {OpSeq | undefined}
*/
  static from_str(s: string): OpSeq | undefined;
/**
* Converts this object to a JSON string.
* @returns {string}
*/
  to_string(): string;
}
/**
* This is a pair of `OpSeq` structs, which is needed to handle some return
* values from `wasm-bindgen`.
*/
export class OpSeqPair {
  free(): void;
/**
* Returns the first element of the pair.
* @returns {OpSeq}
*/
  first(): OpSeq;
/**
* Returns the second element of the pair.
* @returns {OpSeq}
*/
  second(): OpSeq;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_opseq_free: (a: number) => void;
  readonly __wbg_opseqpair_free: (a: number) => void;
  readonly opseq_new: () => number;
  readonly opseq_with_capacity: (a: number) => number;
  readonly opseq_compose: (a: number, b: number) => number;
  readonly opseq_delete: (a: number, b: number) => void;
  readonly opseq_insert: (a: number, b: number, c: number) => void;
  readonly opseq_retain: (a: number, b: number) => void;
  readonly opseq_transform: (a: number, b: number) => number;
  readonly opseq_apply: (a: number, b: number, c: number, d: number) => void;
  readonly opseq_invert: (a: number, b: number, c: number) => number;
  readonly opseq_is_noop: (a: number) => number;
  readonly opseq_base_len: (a: number) => number;
  readonly opseq_target_len: (a: number) => number;
  readonly opseq_transform_index: (a: number, b: number) => number;
  readonly opseq_from_str: (a: number, b: number) => number;
  readonly opseq_to_string: (a: number, b: number) => void;
  readonly opseqpair_first: (a: number) => number;
  readonly opseqpair_second: (a: number) => number;
  readonly set_panic_hook: () => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
