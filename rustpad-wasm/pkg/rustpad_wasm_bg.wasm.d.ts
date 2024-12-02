/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_opseq_free(a: number): void;
export function __wbg_opseqpair_free(a: number): void;
export function opseq_new(): number;
export function opseq_with_capacity(a: number): number;
export function opseq_compose(a: number, b: number): number;
export function opseq_delete(a: number, b: number): void;
export function opseq_insert(a: number, b: number, c: number): void;
export function opseq_retain(a: number, b: number): void;
export function opseq_transform(a: number, b: number): number;
export function opseq_apply(a: number, b: number, c: number, d: number): void;
export function opseq_invert(a: number, b: number, c: number): number;
export function opseq_is_noop(a: number): number;
export function opseq_base_len(a: number): number;
export function opseq_target_len(a: number): number;
export function opseq_transform_index(a: number, b: number): number;
export function opseq_from_str(a: number, b: number): number;
export function opseq_to_string(a: number, b: number): void;
export function opseqpair_first(a: number): number;
export function opseqpair_second(a: number): number;
export function set_panic_hook(): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
