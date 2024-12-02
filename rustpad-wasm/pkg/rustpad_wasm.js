
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
/**
* Set a panic listener to display better error messages.
*/
export function set_panic_hook() {
    wasm.set_panic_hook();
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}
/**
* This is an wrapper around `operational_transform::OperationSeq`, which is
* necessary for Wasm compatibility through `wasm-bindgen`.
*/
export class OpSeq {

    static __wrap(ptr) {
        const obj = Object.create(OpSeq.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_opseq_free(ptr);
    }
    /**
    * Creates a default empty `OpSeq`.
    * @returns {OpSeq}
    */
    static new() {
        var ret = wasm.opseq_new();
        return OpSeq.__wrap(ret);
    }
    /**
    * Creates a store for operatations which does not need to allocate  until
    * `capacity` operations have been stored inside.
    * @param {number} capacity
    * @returns {OpSeq}
    */
    static with_capacity(capacity) {
        var ret = wasm.opseq_with_capacity(capacity);
        return OpSeq.__wrap(ret);
    }
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
    compose(other) {
        _assertClass(other, OpSeq);
        var ret = wasm.opseq_compose(this.ptr, other.ptr);
        return ret === 0 ? undefined : OpSeq.__wrap(ret);
    }
    /**
    * Deletes `n` characters at the current cursor position.
    * @param {number} n
    */
    delete(n) {
        wasm.opseq_delete(this.ptr, n);
    }
    /**
    * Inserts a `s` at the current cursor position.
    * @param {string} s
    */
    insert(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.opseq_insert(this.ptr, ptr0, len0);
    }
    /**
    * Moves the cursor `n` characters forwards.
    * @param {number} n
    */
    retain(n) {
        wasm.opseq_retain(this.ptr, n);
    }
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
    transform(other) {
        _assertClass(other, OpSeq);
        var ret = wasm.opseq_transform(this.ptr, other.ptr);
        return ret === 0 ? undefined : OpSeqPair.__wrap(ret);
    }
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
    apply(s) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.opseq_apply(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Computes the inverse of an operation. The inverse of an operation is the
    * operation that reverts the effects of the operation, e.g. when you have
    * an operation 'insert("hello "); skip(6);' then the inverse is
    * 'delete("hello "); skip(6);'. The inverse should be used for
    * implementing undo.
    * @param {string} s
    * @returns {OpSeq}
    */
    invert(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.opseq_invert(this.ptr, ptr0, len0);
        return OpSeq.__wrap(ret);
    }
    /**
    * Checks if this operation has no effect.
    * @returns {boolean}
    */
    is_noop() {
        var ret = wasm.opseq_is_noop(this.ptr);
        return ret !== 0;
    }
    /**
    * Returns the length of a string these operations can be applied to
    * @returns {number}
    */
    base_len() {
        var ret = wasm.opseq_base_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Returns the length of the resulting string after the operations have
    * been applied.
    * @returns {number}
    */
    target_len() {
        var ret = wasm.opseq_target_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * Return the new index of a position in the string.
    * @param {number} position
    * @returns {number}
    */
    transform_index(position) {
        var ret = wasm.opseq_transform_index(this.ptr, position);
        return ret >>> 0;
    }
    /**
    * Attempts to deserialize an `OpSeq` from a JSON string.
    * @param {string} s
    * @returns {OpSeq | undefined}
    */
    static from_str(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.opseq_from_str(ptr0, len0);
        return ret === 0 ? undefined : OpSeq.__wrap(ret);
    }
    /**
    * Converts this object to a JSON string.
    * @returns {string}
    */
    to_string() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.opseq_to_string(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* This is a pair of `OpSeq` structs, which is needed to handle some return
* values from `wasm-bindgen`.
*/
export class OpSeqPair {

    static __wrap(ptr) {
        const obj = Object.create(OpSeqPair.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_opseqpair_free(ptr);
    }
    /**
    * Returns the first element of the pair.
    * @returns {OpSeq}
    */
    first() {
        var ret = wasm.opseqpair_first(this.ptr);
        return OpSeq.__wrap(ret);
    }
    /**
    * Returns the second element of the pair.
    * @returns {OpSeq}
    */
    second() {
        var ret = wasm.opseqpair_second(this.ptr);
        return OpSeq.__wrap(ret);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('rustpad_wasm_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

