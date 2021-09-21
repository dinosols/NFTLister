const textDecoder = new window.TextDecoder();

class BinaryReader {
    constructor(buf) {
        this.buf = buf;
        this.offset = 0;
    }
    readU8() {
        const value = this.buf.readUInt8(this.offset);
        this.offset += 1;
        return value;
    }
    readU16() {
        const value = this.buf.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    readU32() {
        const value = this.buf.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    readU64() {
        const buf = this.readBuffer(8);
        return new bn_js_1.default(buf, 'le');
    }
    readU128() {
        const buf = this.readBuffer(16);
        return new bn_js_1.default(buf, 'le');
    }
    readU256() {
        const buf = this.readBuffer(32);
        return new bn_js_1.default(buf, 'le');
    }
    readU512() {
        const buf = this.readBuffer(64);
        return new bn_js_1.default(buf, 'le');
    }
    readBuffer(len) {
        if ((this.offset + len) > this.buf.length) {
            throw new `Expected buffer length ${len} isn't within bounds`;
        }
        const result = this.buf.slice(this.offset, this.offset + len);
        this.offset += len;
        return result;
    }
    readString() {
        const len = this.readU32();
        const buf = this.readBuffer(len);
        try {
            // NOTE: Using TextDecoder to fail on invalid UTF-8
            return textDecoder.decode(buf);
        } catch (e) {
            throw `Error decoding UTF-8 string: ${e}`;
        }
    }
    readFixedArray(len) {
        return new Uint8Array(this.readBuffer(len));
    }
    readArray(fn) {
        const len = this.readU32();
        const result = Array();
        for (let i = 0; i < len; ++i) {
            result.push(fn());
        }
        return result;
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function deserializeField(schema, fieldName, fieldType, reader) {
    try {
        if (typeof fieldType === 'string') {
            return reader[`read${capitalizeFirstLetter(fieldType)}`]();
        }
        if (fieldType instanceof Array) {
            if (typeof fieldType[0] === 'number') {
                return reader.readFixedArray(fieldType[0]);
            } else if (typeof fieldType[1] === 'number') {
                const arr = [];
                for (let i = 0; i < fieldType[1]; i++) {
                    arr.push(deserializeField(schema, null, fieldType[0], reader));
                }
                return arr;
            } else {
                return reader.readArray(() => deserializeField(schema, fieldName, fieldType[0], reader));
            }
        }
        if (fieldType.kind === 'option') {
            const option = reader.readU8();
            if (option) {
                return deserializeField(schema, fieldName, fieldType.type, reader);
            }
            return undefined;
        }
        return deserializeStruct(schema, fieldType, reader);
    } catch (error) {
        //error.addToFieldPath(fieldName);
        throw error;
    }
}

function deserializeStruct(schema, classType, reader) {
    if (typeof classType.borshDeserialize === 'function') {
        return classType.borshDeserialize(reader);
    }
    const structSchema = schema.get(classType);
    if (!structSchema) {
        throw new `Class ${classType.name} is missing in schema`;
    }
    if (structSchema.kind === 'struct') {
        const result = {};
        for (const [fieldName, fieldType] of schema.get(classType).fields) {
            result[fieldName] = deserializeField(schema, fieldName, fieldType, reader);
        }
        return new classType(result);
    }
    if (structSchema.kind === 'enum') {
        const idx = reader.readU8();
        if (idx >= structSchema.values.length) {
            throw new `Enum index: ${idx} is out of range`;
        }
        const [fieldName, fieldType] = structSchema.values[idx];
        const fieldValue = deserializeField(schema, fieldName, fieldType, reader);
        return new classType({
            [fieldName]: fieldValue
        });
    }
    throw `Unexpected schema kind: ${structSchema.kind} for ${classType.constructor.name}`;
}

/// Deserializes object from bytes using schema.
function deserialize(schema, classType, buffer, Reader = BinaryReader) {
    const reader = new Reader(buffer);
    const result = deserializeStruct(schema, classType, reader);
    if (reader.offset < buffer.length) {
        throw `Unexpected ${buffer.length - reader.offset} bytes after deserialized data`;
    }
    return result;
}

/// Deserializes object from bytes using schema, without checking the length read
function deserializeUnchecked(schema, classType, buffer, Reader = BinaryReader) {
    const reader = new Reader(buffer);
    return deserializeStruct(schema, classType, reader);
}

function decodeMetadata(buffer) {
    var metadata = (0, deserializeUnchecked)(METADATA_SCHEMA, Metadata, buffer);
    metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '');
    metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '');
    metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '');
    return metadata;
}