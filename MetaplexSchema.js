var to_b58 = function(B) {
    A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    var d = [],
        s = "",
        i, j, c, n;
    for (i in B) {
        j = 0, c = B[i];
        s += c || s.length ^ i ? "" : 1;
        while (j in d || c) {
            n = d[j];
            n = n ? n * 256 + c : c;
            c = n / 58 | 0;
            d[j] = n % 58;
            j++
        }
    }
    while (j--) s += A[d[j]];
    return s
};
var from_b58 = function(S) {
    A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    var d = [],
        b = [],
        i, j, c, n;
    for (i in S) {
        j = 0, c = A.indexOf(S[i]);
        if (c < 0) return undefined;
        c || b.length ^ i ? i : b.push(0);
        while (j in d || c) {
            n = d[j];
            n = n ? n * 58 + c : c;
            c = n >> 8;
            d[j] = n % 256;
            j++
        }
    }
    while (j--) b.push(d[j]);
    return new Uint8Array(b)
};

var extendBorsh = function() {
    BinaryReader.prototype.readPubkey = function() {
        var reader = this;
        var array = reader.readFixedArray(32);
        return new web3_js_1.PublicKey(array);
    };
    BinaryReader.prototype.readPubkeyAsString = function() {
        var reader = this;
        var array = reader.readFixedArray(32);
        return to_b58(array);
    };
};

extendBorsh = extendBorsh;
(0, extendBorsh)();
METADATA_PREFIX = 'metadata';
EDITION = 'edition';
RESERVATION = 'reservation';
MAX_NAME_LENGTH = 32;
MAX_SYMBOL_LENGTH = 10;
MAX_URI_LENGTH = 200;
MAX_CREATOR_LIMIT = 5;
MAX_CREATOR_LEN = 32 + 1 + 1;
MAX_METADATA_LEN = 1 +
    32 +
    32 +
    MAX_NAME_LENGTH +
    MAX_SYMBOL_LENGTH +
    MAX_URI_LENGTH +
    MAX_CREATOR_LIMIT * MAX_CREATOR_LEN +
    2 +
    1 +
    1 +
    198;
MAX_EDITION_LEN = 1 + 32 + 8 + 200;
EDITION_MARKER_BIT_SIZE = 248;
var MetadataKey;
(function(MetadataKey) {
    MetadataKey[MetadataKey["Uninitialized"] = 0] = "Uninitialized";
    MetadataKey[MetadataKey["MetadataV1"] = 4] = "MetadataV1";
    MetadataKey[MetadataKey["EditionV1"] = 1] = "EditionV1";
    MetadataKey[MetadataKey["MasterEditionV1"] = 2] = "MasterEditionV1";
    MetadataKey[MetadataKey["MasterEditionV2"] = 6] = "MasterEditionV2";
    MetadataKey[MetadataKey["EditionMarker"] = 7] = "EditionMarker";
})(MetadataKey = MetadataKey || (MetadataKey = {}));
var MetadataCategory;
(function(MetadataCategory) {
    MetadataCategory["Audio"] = "audio";
    MetadataCategory["Video"] = "video";
    MetadataCategory["Image"] = "image";
    MetadataCategory["VR"] = "vr";
})(MetadataCategory = MetadataCategory || (MetadataCategory = {}));
var MasterEditionV1 = /** @class */ (function() {
    function MasterEditionV1(args) {
        this.key = MetadataKey.MasterEditionV1;
        this.supply = args.supply;
        this.maxSupply = args.maxSupply;
        this.printingMint = args.printingMint;
        this.oneTimePrintingAuthorizationMint =
            args.oneTimePrintingAuthorizationMint;
    }
    return MasterEditionV1;
}());
MasterEditionV1 = MasterEditionV1;
var MasterEditionV2 = /** @class */ (function() {
    function MasterEditionV2(args) {
        this.key = MetadataKey.MasterEditionV2;
        this.supply = args.supply;
        this.maxSupply = args.maxSupply;
    }
    return MasterEditionV2;
}());
MasterEditionV2 = MasterEditionV2;
var EditionMarker = /** @class */ (function() {
    function EditionMarker(args) {
        this.key = MetadataKey.EditionMarker;
        this.ledger = args.ledger;
    }
    EditionMarker.prototype.editionTaken = function(edition) {
        var editionOffset = edition % EDITION_MARKER_BIT_SIZE;
        var indexOffset = Math.floor(editionOffset / 8);
        if (indexOffset > 30) {
            throw Error('bad index for edition');
        }
        var positionInBitsetFromRight = 7 - (editionOffset % 8);
        var mask = Math.pow(2, positionInBitsetFromRight);
        var appliedMask = this.ledger[indexOffset] & mask;
        return appliedMask != 0;
    };
    return EditionMarker;
}());
EditionMarker = EditionMarker;
var Edition = /** @class */ (function() {
    function Edition(args) {
        this.key = MetadataKey.EditionV1;
        this.parent = args.parent;
        this.edition = args.edition;
    }
    return Edition;
}());
Edition = Edition;
var Creator = /** @class */ (function() {
    function Creator(args) {
        this.address = args.address;
        this.verified = args.verified;
        this.share = args.share;
    }
    return Creator;
}());
Creator = Creator;
var Data = /** @class */ (function() {
    function Data(args) {
        this.name = args.name;
        this.symbol = args.symbol;
        this.uri = args.uri;
        this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
        this.creators = args.creators;
    }
    return Data;
}());
Data = Data;
var Metadata = /** @class */ (function() {
    function Metadata(args) {
        this.key = MetadataKey.MetadataV1;
        this.updateAuthority = args.updateAuthority;
        this.mint = args.mint;
        this.data = args.data;
        this.primarySaleHappened = args.primarySaleHappened;
        this.isMutable = args.isMutable;
        this.editionNonce = args.editionNonce;
    }
    return Metadata;
}());
Metadata = Metadata;
var CreateMetadataArgs = /** @class */ (function() {
    function CreateMetadataArgs(args) {
        this.instruction = 0;
        this.data = args.data;
        this.isMutable = args.isMutable;
    }
    return CreateMetadataArgs;
}());
var UpdateMetadataArgs = /** @class */ (function() {
    function UpdateMetadataArgs(args) {
        this.instruction = 1;
        this.data = args.data ? args.data : null;
        this.updateAuthority = args.updateAuthority ? args.updateAuthority : null;
        this.primarySaleHappened = args.primarySaleHappened;
    }
    return UpdateMetadataArgs;
}());
var CreateMasterEditionArgs = /** @class */ (function() {
    function CreateMasterEditionArgs(args) {
        this.instruction = 10;
        this.maxSupply = args.maxSupply;
    }
    return CreateMasterEditionArgs;
}());
var MintPrintingTokensArgs = /** @class */ (function() {
    function MintPrintingTokensArgs(args) {
        this.instruction = 9;
        this.supply = args.supply;
    }
    return MintPrintingTokensArgs;
}());
METADATA_SCHEMA = new Map([
    [
        CreateMetadataArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', Data],
                ['isMutable', 'u8'], // bool
            ]
        },
    ],
    [
        UpdateMetadataArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', { kind: 'option', type: Data }],
                ['updateAuthority', { kind: 'option', type: 'pubkeyAsString' }],
                ['primarySaleHappened', { kind: 'option', type: 'u8' }],
            ]
        },
    ],
    [
        CreateMasterEditionArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['maxSupply', { kind: 'option', type: 'u64' }],
            ]
        },
    ],
    [
        MintPrintingTokensArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['supply', 'u64'],
            ]
        },
    ],
    [
        MasterEditionV1,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['supply', 'u64'],
                ['maxSupply', { kind: 'option', type: 'u64' }],
                ['printingMint', 'pubkeyAsString'],
                ['oneTimePrintingAuthorizationMint', 'pubkeyAsString'],
            ]
        },
    ],
    [
        MasterEditionV2,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['supply', 'u64'],
                ['maxSupply', { kind: 'option', type: 'u64' }],
            ]
        },
    ],
    [
        Edition,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['parent', 'pubkeyAsString'],
                ['edition', 'u64'],
            ]
        },
    ],
    [
        Data,
        {
            kind: 'struct',
            fields: [
                ['name', 'string'],
                ['symbol', 'string'],
                ['uri', 'string'],
                ['sellerFeeBasisPoints', 'u16'],
                ['creators', { kind: 'option', type: [Creator] }],
            ]
        },
    ],
    [
        Creator,
        {
            kind: 'struct',
            fields: [
                ['address', 'pubkeyAsString'],
                ['verified', 'u8'],
                ['share', 'u8'],
            ]
        },
    ],
    [
        Metadata,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['updateAuthority', 'pubkeyAsString'],
                ['mint', 'pubkeyAsString'],
                ['data', Data],
                ['primarySaleHappened', 'u8'],
                ['isMutable', 'u8'], // bool
            ]
        },
    ],
    [
        EditionMarker,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['ledger', [31]],
            ]
        },
    ],
]);
// eslint-disable-next-line no-control-regex
var METADATA_REPLACE = new RegExp('\u0000', 'g');
var decodeMetadata = function(buffer) {
    var metadata = (0, deserializeUnchecked)(METADATA_SCHEMA, Metadata, buffer);
    metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '');
    metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '');
    metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '');
    return metadata;
};
decodeMetadata = decodeMetadata;