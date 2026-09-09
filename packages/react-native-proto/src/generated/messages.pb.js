/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.demo = (function() {

    /**
     * Namespace demo.
     * @exports demo
     * @namespace
     */
    var demo = {};

    demo.User = (function() {

        /**
         * Properties of a User.
         * @memberof demo
         * @interface IUser
         * @property {string|null} [id] User id
         * @property {string|null} [name] User name
         * @property {string|null} [email] User email
         * @property {number|null} [age] User age
         * @property {string|null} [phone] User phone
         * @property {number|Long|null} [createdAt] User createdAt
         * @property {number|Long|null} [updatedAt] User updatedAt
         */

        /**
         * Constructs a new User.
         * @memberof demo
         * @classdesc Represents a User.
         * @implements IUser
         * @constructor
         * @param {demo.IUser=} [properties] Properties to set
         */
        function User(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * User id.
         * @member {string} id
         * @memberof demo.User
         * @instance
         */
        User.prototype.id = "";

        /**
         * User name.
         * @member {string} name
         * @memberof demo.User
         * @instance
         */
        User.prototype.name = "";

        /**
         * User email.
         * @member {string} email
         * @memberof demo.User
         * @instance
         */
        User.prototype.email = "";

        /**
         * User age.
         * @member {number} age
         * @memberof demo.User
         * @instance
         */
        User.prototype.age = 0;

        /**
         * User phone.
         * @member {string} phone
         * @memberof demo.User
         * @instance
         */
        User.prototype.phone = "";

        /**
         * User createdAt.
         * @member {number|Long} createdAt
         * @memberof demo.User
         * @instance
         */
        User.prototype.createdAt = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * User updatedAt.
         * @member {number|Long} updatedAt
         * @memberof demo.User
         * @instance
         */
        User.prototype.updatedAt = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new User instance using the specified properties.
         * @function create
         * @memberof demo.User
         * @static
         * @param {demo.IUser=} [properties] Properties to set
         * @returns {demo.User} User instance
         */
        User.create = function create(properties) {
            return new User(properties);
        };

        /**
         * Encodes the specified User message. Does not implicitly {@link demo.User.verify|verify} messages.
         * @function encode
         * @memberof demo.User
         * @static
         * @param {demo.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.email);
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.age);
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.phone);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 6, wireType 0 =*/48).int64(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link demo.User.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.User
         * @static
         * @param {demo.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a User message from the specified reader or buffer.
         * @function decode
         * @memberof demo.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.User();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.email = reader.string();
                        break;
                    }
                case 4: {
                        message.age = reader.int32();
                        break;
                    }
                case 5: {
                        message.phone = reader.string();
                        break;
                    }
                case 6: {
                        message.createdAt = reader.int64();
                        break;
                    }
                case 7: {
                        message.updatedAt = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a User message.
         * @function verify
         * @memberof demo.User
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        User.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                if (!$util.isInteger(message.age))
                    return "age: integer expected";
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                if (!$util.isString(message.phone))
                    return "phone: string expected";
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                if (!$util.isInteger(message.createdAt) && !(message.createdAt && $util.isInteger(message.createdAt.low) && $util.isInteger(message.createdAt.high)))
                    return "createdAt: integer|Long expected";
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                if (!$util.isInteger(message.updatedAt) && !(message.updatedAt && $util.isInteger(message.updatedAt.low) && $util.isInteger(message.updatedAt.high)))
                    return "updatedAt: integer|Long expected";
            return null;
        };

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.User
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.User} User
         */
        User.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.User)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.User: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.User();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.email != null)
                message.email = String(object.email);
            if (object.age != null)
                message.age = object.age | 0;
            if (object.phone != null)
                message.phone = String(object.phone);
            if (object.createdAt != null)
                if ($util.Long)
                    message.createdAt = $util.Long.fromValue(object.createdAt, false);
                else if (typeof object.createdAt === "string")
                    message.createdAt = parseInt(object.createdAt, 10);
                else if (typeof object.createdAt === "number")
                    message.createdAt = object.createdAt;
                else if (typeof object.createdAt === "object")
                    message.createdAt = new $util.LongBits(object.createdAt.low >>> 0, object.createdAt.high >>> 0).toNumber();
            if (object.updatedAt != null)
                if ($util.Long)
                    message.updatedAt = $util.Long.fromValue(object.updatedAt, false);
                else if (typeof object.updatedAt === "string")
                    message.updatedAt = parseInt(object.updatedAt, 10);
                else if (typeof object.updatedAt === "number")
                    message.updatedAt = object.updatedAt;
                else if (typeof object.updatedAt === "object")
                    message.updatedAt = new $util.LongBits(object.updatedAt.low >>> 0, object.updatedAt.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.User
         * @static
         * @param {demo.User} message User
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        User.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.email = "";
                object.age = 0;
                object.phone = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.createdAt = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                    object.createdAt = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.updatedAt = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : typeof BigInt !== "undefined" && options.longs === BigInt ? long.toBigInt() : long;
                } else
                    object.updatedAt = options.longs === String ? "0" : typeof BigInt !== "undefined" && options.longs === BigInt ? BigInt("0") : 0;
            }
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                object.name = message.name;
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                object.email = message.email;
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                object.age = message.age;
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                object.phone = message.phone;
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                    object.createdAt = typeof message.createdAt === "number" ? BigInt(message.createdAt) : $util.Long.fromBits(message.createdAt.low >>> 0, message.createdAt.high >>> 0, false).toBigInt();
                else if (typeof message.createdAt === "number")
                    object.createdAt = options.longs === String ? String(message.createdAt) : message.createdAt;
                else
                    object.createdAt = options.longs === String ? $util.Long.prototype.toString.call(message.createdAt) : options.longs === Number ? new $util.LongBits(message.createdAt.low >>> 0, message.createdAt.high >>> 0).toNumber() : message.createdAt;
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                if (typeof BigInt !== "undefined" && options.longs === BigInt)
                    object.updatedAt = typeof message.updatedAt === "number" ? BigInt(message.updatedAt) : $util.Long.fromBits(message.updatedAt.low >>> 0, message.updatedAt.high >>> 0, false).toBigInt();
                else if (typeof message.updatedAt === "number")
                    object.updatedAt = options.longs === String ? String(message.updatedAt) : message.updatedAt;
                else
                    object.updatedAt = options.longs === String ? $util.Long.prototype.toString.call(message.updatedAt) : options.longs === Number ? new $util.LongBits(message.updatedAt.low >>> 0, message.updatedAt.high >>> 0).toNumber() : message.updatedAt;
            return object;
        };

        /**
         * Converts this User to JSON.
         * @function toJSON
         * @memberof demo.User
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        User.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for User
         * @function getTypeUrl
         * @memberof demo.User
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        User.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.User";
        };

        return User;
    })();

    demo.GetUserRequest = (function() {

        /**
         * Properties of a GetUserRequest.
         * @memberof demo
         * @interface IGetUserRequest
         * @property {string|null} [id] GetUserRequest id
         */

        /**
         * Constructs a new GetUserRequest.
         * @memberof demo
         * @classdesc Represents a GetUserRequest.
         * @implements IGetUserRequest
         * @constructor
         * @param {demo.IGetUserRequest=} [properties] Properties to set
         */
        function GetUserRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetUserRequest id.
         * @member {string} id
         * @memberof demo.GetUserRequest
         * @instance
         */
        GetUserRequest.prototype.id = "";

        /**
         * Creates a new GetUserRequest instance using the specified properties.
         * @function create
         * @memberof demo.GetUserRequest
         * @static
         * @param {demo.IGetUserRequest=} [properties] Properties to set
         * @returns {demo.GetUserRequest} GetUserRequest instance
         */
        GetUserRequest.create = function create(properties) {
            return new GetUserRequest(properties);
        };

        /**
         * Encodes the specified GetUserRequest message. Does not implicitly {@link demo.GetUserRequest.verify|verify} messages.
         * @function encode
         * @memberof demo.GetUserRequest
         * @static
         * @param {demo.IGetUserRequest} message GetUserRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetUserRequest.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            return writer;
        };

        /**
         * Encodes the specified GetUserRequest message, length delimited. Does not implicitly {@link demo.GetUserRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.GetUserRequest
         * @static
         * @param {demo.IGetUserRequest} message GetUserRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetUserRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a GetUserRequest message from the specified reader or buffer.
         * @function decode
         * @memberof demo.GetUserRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.GetUserRequest} GetUserRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetUserRequest.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.GetUserRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a GetUserRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.GetUserRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.GetUserRequest} GetUserRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetUserRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetUserRequest message.
         * @function verify
         * @memberof demo.GetUserRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetUserRequest.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            return null;
        };

        /**
         * Creates a GetUserRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.GetUserRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.GetUserRequest} GetUserRequest
         */
        GetUserRequest.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.GetUserRequest)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.GetUserRequest: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.GetUserRequest();
            if (object.id != null)
                message.id = String(object.id);
            return message;
        };

        /**
         * Creates a plain object from a GetUserRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.GetUserRequest
         * @static
         * @param {demo.GetUserRequest} message GetUserRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetUserRequest.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults)
                object.id = "";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            return object;
        };

        /**
         * Converts this GetUserRequest to JSON.
         * @function toJSON
         * @memberof demo.GetUserRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetUserRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetUserRequest
         * @function getTypeUrl
         * @memberof demo.GetUserRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetUserRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.GetUserRequest";
        };

        return GetUserRequest;
    })();

    demo.GetUserByEmailRequest = (function() {

        /**
         * Properties of a GetUserByEmailRequest.
         * @memberof demo
         * @interface IGetUserByEmailRequest
         * @property {string|null} [email] GetUserByEmailRequest email
         */

        /**
         * Constructs a new GetUserByEmailRequest.
         * @memberof demo
         * @classdesc Represents a GetUserByEmailRequest.
         * @implements IGetUserByEmailRequest
         * @constructor
         * @param {demo.IGetUserByEmailRequest=} [properties] Properties to set
         */
        function GetUserByEmailRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetUserByEmailRequest email.
         * @member {string} email
         * @memberof demo.GetUserByEmailRequest
         * @instance
         */
        GetUserByEmailRequest.prototype.email = "";

        /**
         * Creates a new GetUserByEmailRequest instance using the specified properties.
         * @function create
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {demo.IGetUserByEmailRequest=} [properties] Properties to set
         * @returns {demo.GetUserByEmailRequest} GetUserByEmailRequest instance
         */
        GetUserByEmailRequest.create = function create(properties) {
            return new GetUserByEmailRequest(properties);
        };

        /**
         * Encodes the specified GetUserByEmailRequest message. Does not implicitly {@link demo.GetUserByEmailRequest.verify|verify} messages.
         * @function encode
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {demo.IGetUserByEmailRequest} message GetUserByEmailRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetUserByEmailRequest.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.email);
            return writer;
        };

        /**
         * Encodes the specified GetUserByEmailRequest message, length delimited. Does not implicitly {@link demo.GetUserByEmailRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {demo.IGetUserByEmailRequest} message GetUserByEmailRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetUserByEmailRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a GetUserByEmailRequest message from the specified reader or buffer.
         * @function decode
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.GetUserByEmailRequest} GetUserByEmailRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetUserByEmailRequest.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.GetUserByEmailRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.email = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a GetUserByEmailRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.GetUserByEmailRequest} GetUserByEmailRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetUserByEmailRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetUserByEmailRequest message.
         * @function verify
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetUserByEmailRequest.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            return null;
        };

        /**
         * Creates a GetUserByEmailRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.GetUserByEmailRequest} GetUserByEmailRequest
         */
        GetUserByEmailRequest.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.GetUserByEmailRequest)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.GetUserByEmailRequest: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.GetUserByEmailRequest();
            if (object.email != null)
                message.email = String(object.email);
            return message;
        };

        /**
         * Creates a plain object from a GetUserByEmailRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {demo.GetUserByEmailRequest} message GetUserByEmailRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetUserByEmailRequest.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults)
                object.email = "";
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                object.email = message.email;
            return object;
        };

        /**
         * Converts this GetUserByEmailRequest to JSON.
         * @function toJSON
         * @memberof demo.GetUserByEmailRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetUserByEmailRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetUserByEmailRequest
         * @function getTypeUrl
         * @memberof demo.GetUserByEmailRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetUserByEmailRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.GetUserByEmailRequest";
        };

        return GetUserByEmailRequest;
    })();

    demo.ListUsersRequest = (function() {

        /**
         * Properties of a ListUsersRequest.
         * @memberof demo
         * @interface IListUsersRequest
         * @property {number|null} [page] ListUsersRequest page
         * @property {number|null} [pageSize] ListUsersRequest pageSize
         * @property {string|null} [pageToken] ListUsersRequest pageToken
         * @property {string|null} [query] ListUsersRequest query
         */

        /**
         * Constructs a new ListUsersRequest.
         * @memberof demo
         * @classdesc Represents a ListUsersRequest.
         * @implements IListUsersRequest
         * @constructor
         * @param {demo.IListUsersRequest=} [properties] Properties to set
         */
        function ListUsersRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListUsersRequest page.
         * @member {number} page
         * @memberof demo.ListUsersRequest
         * @instance
         */
        ListUsersRequest.prototype.page = 0;

        /**
         * ListUsersRequest pageSize.
         * @member {number} pageSize
         * @memberof demo.ListUsersRequest
         * @instance
         */
        ListUsersRequest.prototype.pageSize = 0;

        /**
         * ListUsersRequest pageToken.
         * @member {string} pageToken
         * @memberof demo.ListUsersRequest
         * @instance
         */
        ListUsersRequest.prototype.pageToken = "";

        /**
         * ListUsersRequest query.
         * @member {string} query
         * @memberof demo.ListUsersRequest
         * @instance
         */
        ListUsersRequest.prototype.query = "";

        /**
         * Creates a new ListUsersRequest instance using the specified properties.
         * @function create
         * @memberof demo.ListUsersRequest
         * @static
         * @param {demo.IListUsersRequest=} [properties] Properties to set
         * @returns {demo.ListUsersRequest} ListUsersRequest instance
         */
        ListUsersRequest.create = function create(properties) {
            return new ListUsersRequest(properties);
        };

        /**
         * Encodes the specified ListUsersRequest message. Does not implicitly {@link demo.ListUsersRequest.verify|verify} messages.
         * @function encode
         * @memberof demo.ListUsersRequest
         * @static
         * @param {demo.IListUsersRequest} message ListUsersRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListUsersRequest.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.page != null && Object.hasOwnProperty.call(message, "page"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.page);
            if (message.pageSize != null && Object.hasOwnProperty.call(message, "pageSize"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.pageSize);
            if (message.pageToken != null && Object.hasOwnProperty.call(message, "pageToken"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.pageToken);
            if (message.query != null && Object.hasOwnProperty.call(message, "query"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.query);
            return writer;
        };

        /**
         * Encodes the specified ListUsersRequest message, length delimited. Does not implicitly {@link demo.ListUsersRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.ListUsersRequest
         * @static
         * @param {demo.IListUsersRequest} message ListUsersRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListUsersRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a ListUsersRequest message from the specified reader or buffer.
         * @function decode
         * @memberof demo.ListUsersRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.ListUsersRequest} ListUsersRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListUsersRequest.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.ListUsersRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.page = reader.int32();
                        break;
                    }
                case 2: {
                        message.pageSize = reader.int32();
                        break;
                    }
                case 3: {
                        message.pageToken = reader.string();
                        break;
                    }
                case 4: {
                        message.query = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a ListUsersRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.ListUsersRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.ListUsersRequest} ListUsersRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListUsersRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListUsersRequest message.
         * @function verify
         * @memberof demo.ListUsersRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListUsersRequest.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.page != null && Object.hasOwnProperty.call(message, "page"))
                if (!$util.isInteger(message.page))
                    return "page: integer expected";
            if (message.pageSize != null && Object.hasOwnProperty.call(message, "pageSize"))
                if (!$util.isInteger(message.pageSize))
                    return "pageSize: integer expected";
            if (message.pageToken != null && Object.hasOwnProperty.call(message, "pageToken"))
                if (!$util.isString(message.pageToken))
                    return "pageToken: string expected";
            if (message.query != null && Object.hasOwnProperty.call(message, "query"))
                if (!$util.isString(message.query))
                    return "query: string expected";
            return null;
        };

        /**
         * Creates a ListUsersRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.ListUsersRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.ListUsersRequest} ListUsersRequest
         */
        ListUsersRequest.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.ListUsersRequest)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.ListUsersRequest: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.ListUsersRequest();
            if (object.page != null)
                message.page = object.page | 0;
            if (object.pageSize != null)
                message.pageSize = object.pageSize | 0;
            if (object.pageToken != null)
                message.pageToken = String(object.pageToken);
            if (object.query != null)
                message.query = String(object.query);
            return message;
        };

        /**
         * Creates a plain object from a ListUsersRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.ListUsersRequest
         * @static
         * @param {demo.ListUsersRequest} message ListUsersRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListUsersRequest.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults) {
                object.page = 0;
                object.pageSize = 0;
                object.pageToken = "";
                object.query = "";
            }
            if (message.page != null && Object.hasOwnProperty.call(message, "page"))
                object.page = message.page;
            if (message.pageSize != null && Object.hasOwnProperty.call(message, "pageSize"))
                object.pageSize = message.pageSize;
            if (message.pageToken != null && Object.hasOwnProperty.call(message, "pageToken"))
                object.pageToken = message.pageToken;
            if (message.query != null && Object.hasOwnProperty.call(message, "query"))
                object.query = message.query;
            return object;
        };

        /**
         * Converts this ListUsersRequest to JSON.
         * @function toJSON
         * @memberof demo.ListUsersRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListUsersRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListUsersRequest
         * @function getTypeUrl
         * @memberof demo.ListUsersRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListUsersRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.ListUsersRequest";
        };

        return ListUsersRequest;
    })();

    demo.ListUsersResponse = (function() {

        /**
         * Properties of a ListUsersResponse.
         * @memberof demo
         * @interface IListUsersResponse
         * @property {Array.<demo.IUser>|null} [users] ListUsersResponse users
         * @property {string|null} [nextPageToken] ListUsersResponse nextPageToken
         * @property {number|null} [totalCount] ListUsersResponse totalCount
         */

        /**
         * Constructs a new ListUsersResponse.
         * @memberof demo
         * @classdesc Represents a ListUsersResponse.
         * @implements IListUsersResponse
         * @constructor
         * @param {demo.IListUsersResponse=} [properties] Properties to set
         */
        function ListUsersResponse(properties) {
            this.users = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListUsersResponse users.
         * @member {Array.<demo.IUser>} users
         * @memberof demo.ListUsersResponse
         * @instance
         */
        ListUsersResponse.prototype.users = $util.emptyArray;

        /**
         * ListUsersResponse nextPageToken.
         * @member {string} nextPageToken
         * @memberof demo.ListUsersResponse
         * @instance
         */
        ListUsersResponse.prototype.nextPageToken = "";

        /**
         * ListUsersResponse totalCount.
         * @member {number} totalCount
         * @memberof demo.ListUsersResponse
         * @instance
         */
        ListUsersResponse.prototype.totalCount = 0;

        /**
         * Creates a new ListUsersResponse instance using the specified properties.
         * @function create
         * @memberof demo.ListUsersResponse
         * @static
         * @param {demo.IListUsersResponse=} [properties] Properties to set
         * @returns {demo.ListUsersResponse} ListUsersResponse instance
         */
        ListUsersResponse.create = function create(properties) {
            return new ListUsersResponse(properties);
        };

        /**
         * Encodes the specified ListUsersResponse message. Does not implicitly {@link demo.ListUsersResponse.verify|verify} messages.
         * @function encode
         * @memberof demo.ListUsersResponse
         * @static
         * @param {demo.IListUsersResponse} message ListUsersResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListUsersResponse.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.users != null && message.users.length)
                for (var i = 0; i < message.users.length; ++i)
                    $root.demo.User.encode(message.users[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), q + 1).ldelim();
            if (message.nextPageToken != null && Object.hasOwnProperty.call(message, "nextPageToken"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.nextPageToken);
            if (message.totalCount != null && Object.hasOwnProperty.call(message, "totalCount"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.totalCount);
            return writer;
        };

        /**
         * Encodes the specified ListUsersResponse message, length delimited. Does not implicitly {@link demo.ListUsersResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.ListUsersResponse
         * @static
         * @param {demo.IListUsersResponse} message ListUsersResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListUsersResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a ListUsersResponse message from the specified reader or buffer.
         * @function decode
         * @memberof demo.ListUsersResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.ListUsersResponse} ListUsersResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListUsersResponse.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.ListUsersResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.users && message.users.length))
                            message.users = [];
                        message.users.push($root.demo.User.decode(reader, reader.uint32(), undefined, long + 1));
                        break;
                    }
                case 2: {
                        message.nextPageToken = reader.string();
                        break;
                    }
                case 3: {
                        message.totalCount = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a ListUsersResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.ListUsersResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.ListUsersResponse} ListUsersResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListUsersResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListUsersResponse message.
         * @function verify
         * @memberof demo.ListUsersResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListUsersResponse.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.users != null && Object.hasOwnProperty.call(message, "users")) {
                if (!Array.isArray(message.users))
                    return "users: array expected";
                for (var i = 0; i < message.users.length; ++i) {
                    var error = $root.demo.User.verify(message.users[i], long + 1);
                    if (error)
                        return "users." + error;
                }
            }
            if (message.nextPageToken != null && Object.hasOwnProperty.call(message, "nextPageToken"))
                if (!$util.isString(message.nextPageToken))
                    return "nextPageToken: string expected";
            if (message.totalCount != null && Object.hasOwnProperty.call(message, "totalCount"))
                if (!$util.isInteger(message.totalCount))
                    return "totalCount: integer expected";
            return null;
        };

        /**
         * Creates a ListUsersResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.ListUsersResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.ListUsersResponse} ListUsersResponse
         */
        ListUsersResponse.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.ListUsersResponse)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.ListUsersResponse: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.ListUsersResponse();
            if (object.users) {
                if (!Array.isArray(object.users))
                    throw TypeError(".demo.ListUsersResponse.users: array expected");
                message.users = [];
                for (var i = 0; i < object.users.length; ++i) {
                    if (!$util.isObject(object.users[i]))
                        throw TypeError(".demo.ListUsersResponse.users: object expected");
                    message.users[i] = $root.demo.User.fromObject(object.users[i], long + 1);
                }
            }
            if (object.nextPageToken != null)
                message.nextPageToken = String(object.nextPageToken);
            if (object.totalCount != null)
                message.totalCount = object.totalCount | 0;
            return message;
        };

        /**
         * Creates a plain object from a ListUsersResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.ListUsersResponse
         * @static
         * @param {demo.ListUsersResponse} message ListUsersResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListUsersResponse.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.arrays || options.defaults)
                object.users = [];
            if (options.defaults) {
                object.nextPageToken = "";
                object.totalCount = 0;
            }
            if (message.users && message.users.length) {
                object.users = [];
                for (var j = 0; j < message.users.length; ++j)
                    object.users[j] = $root.demo.User.toObject(message.users[j], options, q + 1);
            }
            if (message.nextPageToken != null && Object.hasOwnProperty.call(message, "nextPageToken"))
                object.nextPageToken = message.nextPageToken;
            if (message.totalCount != null && Object.hasOwnProperty.call(message, "totalCount"))
                object.totalCount = message.totalCount;
            return object;
        };

        /**
         * Converts this ListUsersResponse to JSON.
         * @function toJSON
         * @memberof demo.ListUsersResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListUsersResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListUsersResponse
         * @function getTypeUrl
         * @memberof demo.ListUsersResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListUsersResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.ListUsersResponse";
        };

        return ListUsersResponse;
    })();

    demo.AddUserRequest = (function() {

        /**
         * Properties of an AddUserRequest.
         * @memberof demo
         * @interface IAddUserRequest
         * @property {string|null} [name] AddUserRequest name
         * @property {string|null} [email] AddUserRequest email
         * @property {number|null} [age] AddUserRequest age
         * @property {string|null} [phone] AddUserRequest phone
         */

        /**
         * Constructs a new AddUserRequest.
         * @memberof demo
         * @classdesc Represents an AddUserRequest.
         * @implements IAddUserRequest
         * @constructor
         * @param {demo.IAddUserRequest=} [properties] Properties to set
         */
        function AddUserRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AddUserRequest name.
         * @member {string} name
         * @memberof demo.AddUserRequest
         * @instance
         */
        AddUserRequest.prototype.name = "";

        /**
         * AddUserRequest email.
         * @member {string} email
         * @memberof demo.AddUserRequest
         * @instance
         */
        AddUserRequest.prototype.email = "";

        /**
         * AddUserRequest age.
         * @member {number} age
         * @memberof demo.AddUserRequest
         * @instance
         */
        AddUserRequest.prototype.age = 0;

        /**
         * AddUserRequest phone.
         * @member {string} phone
         * @memberof demo.AddUserRequest
         * @instance
         */
        AddUserRequest.prototype.phone = "";

        /**
         * Creates a new AddUserRequest instance using the specified properties.
         * @function create
         * @memberof demo.AddUserRequest
         * @static
         * @param {demo.IAddUserRequest=} [properties] Properties to set
         * @returns {demo.AddUserRequest} AddUserRequest instance
         */
        AddUserRequest.create = function create(properties) {
            return new AddUserRequest(properties);
        };

        /**
         * Encodes the specified AddUserRequest message. Does not implicitly {@link demo.AddUserRequest.verify|verify} messages.
         * @function encode
         * @memberof demo.AddUserRequest
         * @static
         * @param {demo.IAddUserRequest} message AddUserRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddUserRequest.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.email);
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.age);
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.phone);
            return writer;
        };

        /**
         * Encodes the specified AddUserRequest message, length delimited. Does not implicitly {@link demo.AddUserRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.AddUserRequest
         * @static
         * @param {demo.IAddUserRequest} message AddUserRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddUserRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes an AddUserRequest message from the specified reader or buffer.
         * @function decode
         * @memberof demo.AddUserRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.AddUserRequest} AddUserRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddUserRequest.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.AddUserRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
                        message.email = reader.string();
                        break;
                    }
                case 3: {
                        message.age = reader.int32();
                        break;
                    }
                case 4: {
                        message.phone = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes an AddUserRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.AddUserRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.AddUserRequest} AddUserRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddUserRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AddUserRequest message.
         * @function verify
         * @memberof demo.AddUserRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AddUserRequest.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                if (!$util.isInteger(message.age))
                    return "age: integer expected";
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                if (!$util.isString(message.phone))
                    return "phone: string expected";
            return null;
        };

        /**
         * Creates an AddUserRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.AddUserRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.AddUserRequest} AddUserRequest
         */
        AddUserRequest.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.AddUserRequest)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.AddUserRequest: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.AddUserRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.email != null)
                message.email = String(object.email);
            if (object.age != null)
                message.age = object.age | 0;
            if (object.phone != null)
                message.phone = String(object.phone);
            return message;
        };

        /**
         * Creates a plain object from an AddUserRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.AddUserRequest
         * @static
         * @param {demo.AddUserRequest} message AddUserRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AddUserRequest.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.email = "";
                object.age = 0;
                object.phone = "";
            }
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                object.name = message.name;
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                object.email = message.email;
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                object.age = message.age;
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                object.phone = message.phone;
            return object;
        };

        /**
         * Converts this AddUserRequest to JSON.
         * @function toJSON
         * @memberof demo.AddUserRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AddUserRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for AddUserRequest
         * @function getTypeUrl
         * @memberof demo.AddUserRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        AddUserRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.AddUserRequest";
        };

        return AddUserRequest;
    })();

    demo.UpdateUserRequest = (function() {

        /**
         * Properties of an UpdateUserRequest.
         * @memberof demo
         * @interface IUpdateUserRequest
         * @property {string|null} [id] UpdateUserRequest id
         * @property {string|null} [name] UpdateUserRequest name
         * @property {string|null} [email] UpdateUserRequest email
         * @property {number|null} [age] UpdateUserRequest age
         * @property {string|null} [phone] UpdateUserRequest phone
         */

        /**
         * Constructs a new UpdateUserRequest.
         * @memberof demo
         * @classdesc Represents an UpdateUserRequest.
         * @implements IUpdateUserRequest
         * @constructor
         * @param {demo.IUpdateUserRequest=} [properties] Properties to set
         */
        function UpdateUserRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateUserRequest id.
         * @member {string} id
         * @memberof demo.UpdateUserRequest
         * @instance
         */
        UpdateUserRequest.prototype.id = "";

        /**
         * UpdateUserRequest name.
         * @member {string} name
         * @memberof demo.UpdateUserRequest
         * @instance
         */
        UpdateUserRequest.prototype.name = "";

        /**
         * UpdateUserRequest email.
         * @member {string} email
         * @memberof demo.UpdateUserRequest
         * @instance
         */
        UpdateUserRequest.prototype.email = "";

        /**
         * UpdateUserRequest age.
         * @member {number} age
         * @memberof demo.UpdateUserRequest
         * @instance
         */
        UpdateUserRequest.prototype.age = 0;

        /**
         * UpdateUserRequest phone.
         * @member {string} phone
         * @memberof demo.UpdateUserRequest
         * @instance
         */
        UpdateUserRequest.prototype.phone = "";

        /**
         * Creates a new UpdateUserRequest instance using the specified properties.
         * @function create
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {demo.IUpdateUserRequest=} [properties] Properties to set
         * @returns {demo.UpdateUserRequest} UpdateUserRequest instance
         */
        UpdateUserRequest.create = function create(properties) {
            return new UpdateUserRequest(properties);
        };

        /**
         * Encodes the specified UpdateUserRequest message. Does not implicitly {@link demo.UpdateUserRequest.verify|verify} messages.
         * @function encode
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {demo.IUpdateUserRequest} message UpdateUserRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateUserRequest.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.email);
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.age);
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.phone);
            return writer;
        };

        /**
         * Encodes the specified UpdateUserRequest message, length delimited. Does not implicitly {@link demo.UpdateUserRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {demo.IUpdateUserRequest} message UpdateUserRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateUserRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes an UpdateUserRequest message from the specified reader or buffer.
         * @function decode
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.UpdateUserRequest} UpdateUserRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateUserRequest.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.UpdateUserRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.email = reader.string();
                        break;
                    }
                case 4: {
                        message.age = reader.int32();
                        break;
                    }
                case 5: {
                        message.phone = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes an UpdateUserRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.UpdateUserRequest} UpdateUserRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateUserRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateUserRequest message.
         * @function verify
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateUserRequest.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                if (!$util.isInteger(message.age))
                    return "age: integer expected";
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                if (!$util.isString(message.phone))
                    return "phone: string expected";
            return null;
        };

        /**
         * Creates an UpdateUserRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.UpdateUserRequest} UpdateUserRequest
         */
        UpdateUserRequest.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.UpdateUserRequest)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.UpdateUserRequest: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.UpdateUserRequest();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.email != null)
                message.email = String(object.email);
            if (object.age != null)
                message.age = object.age | 0;
            if (object.phone != null)
                message.phone = String(object.phone);
            return message;
        };

        /**
         * Creates a plain object from an UpdateUserRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {demo.UpdateUserRequest} message UpdateUserRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateUserRequest.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.email = "";
                object.age = 0;
                object.phone = "";
            }
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                object.name = message.name;
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                object.email = message.email;
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                object.age = message.age;
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                object.phone = message.phone;
            return object;
        };

        /**
         * Converts this UpdateUserRequest to JSON.
         * @function toJSON
         * @memberof demo.UpdateUserRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateUserRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateUserRequest
         * @function getTypeUrl
         * @memberof demo.UpdateUserRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateUserRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.UpdateUserRequest";
        };

        return UpdateUserRequest;
    })();

    demo.DeleteUserRequest = (function() {

        /**
         * Properties of a DeleteUserRequest.
         * @memberof demo
         * @interface IDeleteUserRequest
         * @property {string|null} [id] DeleteUserRequest id
         */

        /**
         * Constructs a new DeleteUserRequest.
         * @memberof demo
         * @classdesc Represents a DeleteUserRequest.
         * @implements IDeleteUserRequest
         * @constructor
         * @param {demo.IDeleteUserRequest=} [properties] Properties to set
         */
        function DeleteUserRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DeleteUserRequest id.
         * @member {string} id
         * @memberof demo.DeleteUserRequest
         * @instance
         */
        DeleteUserRequest.prototype.id = "";

        /**
         * Creates a new DeleteUserRequest instance using the specified properties.
         * @function create
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {demo.IDeleteUserRequest=} [properties] Properties to set
         * @returns {demo.DeleteUserRequest} DeleteUserRequest instance
         */
        DeleteUserRequest.create = function create(properties) {
            return new DeleteUserRequest(properties);
        };

        /**
         * Encodes the specified DeleteUserRequest message. Does not implicitly {@link demo.DeleteUserRequest.verify|verify} messages.
         * @function encode
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {demo.IDeleteUserRequest} message DeleteUserRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DeleteUserRequest.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            return writer;
        };

        /**
         * Encodes the specified DeleteUserRequest message, length delimited. Does not implicitly {@link demo.DeleteUserRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {demo.IDeleteUserRequest} message DeleteUserRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DeleteUserRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a DeleteUserRequest message from the specified reader or buffer.
         * @function decode
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.DeleteUserRequest} DeleteUserRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DeleteUserRequest.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.DeleteUserRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a DeleteUserRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.DeleteUserRequest} DeleteUserRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DeleteUserRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DeleteUserRequest message.
         * @function verify
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DeleteUserRequest.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            return null;
        };

        /**
         * Creates a DeleteUserRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.DeleteUserRequest} DeleteUserRequest
         */
        DeleteUserRequest.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.DeleteUserRequest)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.DeleteUserRequest: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.DeleteUserRequest();
            if (object.id != null)
                message.id = String(object.id);
            return message;
        };

        /**
         * Creates a plain object from a DeleteUserRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {demo.DeleteUserRequest} message DeleteUserRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DeleteUserRequest.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults)
                object.id = "";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            return object;
        };

        /**
         * Converts this DeleteUserRequest to JSON.
         * @function toJSON
         * @memberof demo.DeleteUserRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DeleteUserRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DeleteUserRequest
         * @function getTypeUrl
         * @memberof demo.DeleteUserRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DeleteUserRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.DeleteUserRequest";
        };

        return DeleteUserRequest;
    })();

    demo.DeleteUserResponse = (function() {

        /**
         * Properties of a DeleteUserResponse.
         * @memberof demo
         * @interface IDeleteUserResponse
         * @property {boolean|null} [success] DeleteUserResponse success
         * @property {string|null} [id] DeleteUserResponse id
         */

        /**
         * Constructs a new DeleteUserResponse.
         * @memberof demo
         * @classdesc Represents a DeleteUserResponse.
         * @implements IDeleteUserResponse
         * @constructor
         * @param {demo.IDeleteUserResponse=} [properties] Properties to set
         */
        function DeleteUserResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DeleteUserResponse success.
         * @member {boolean} success
         * @memberof demo.DeleteUserResponse
         * @instance
         */
        DeleteUserResponse.prototype.success = false;

        /**
         * DeleteUserResponse id.
         * @member {string} id
         * @memberof demo.DeleteUserResponse
         * @instance
         */
        DeleteUserResponse.prototype.id = "";

        /**
         * Creates a new DeleteUserResponse instance using the specified properties.
         * @function create
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {demo.IDeleteUserResponse=} [properties] Properties to set
         * @returns {demo.DeleteUserResponse} DeleteUserResponse instance
         */
        DeleteUserResponse.create = function create(properties) {
            return new DeleteUserResponse(properties);
        };

        /**
         * Encodes the specified DeleteUserResponse message. Does not implicitly {@link demo.DeleteUserResponse.verify|verify} messages.
         * @function encode
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {demo.IDeleteUserResponse} message DeleteUserResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DeleteUserResponse.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.id);
            return writer;
        };

        /**
         * Encodes the specified DeleteUserResponse message, length delimited. Does not implicitly {@link demo.DeleteUserResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {demo.IDeleteUserResponse} message DeleteUserResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DeleteUserResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a DeleteUserResponse message from the specified reader or buffer.
         * @function decode
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.DeleteUserResponse} DeleteUserResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DeleteUserResponse.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.DeleteUserResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.success = reader.bool();
                        break;
                    }
                case 2: {
                        message.id = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a DeleteUserResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.DeleteUserResponse} DeleteUserResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DeleteUserResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DeleteUserResponse message.
         * @function verify
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DeleteUserResponse.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            return null;
        };

        /**
         * Creates a DeleteUserResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.DeleteUserResponse} DeleteUserResponse
         */
        DeleteUserResponse.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.DeleteUserResponse)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.DeleteUserResponse: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.DeleteUserResponse();
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.id != null)
                message.id = String(object.id);
            return message;
        };

        /**
         * Creates a plain object from a DeleteUserResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {demo.DeleteUserResponse} message DeleteUserResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DeleteUserResponse.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults) {
                object.success = false;
                object.id = "";
            }
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                object.success = message.success;
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                object.id = message.id;
            return object;
        };

        /**
         * Converts this DeleteUserResponse to JSON.
         * @function toJSON
         * @memberof demo.DeleteUserResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DeleteUserResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DeleteUserResponse
         * @function getTypeUrl
         * @memberof demo.DeleteUserResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DeleteUserResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.DeleteUserResponse";
        };

        return DeleteUserResponse;
    })();

    demo.GetUserByPhoneRequest = (function() {

        /**
         * Properties of a GetUserByPhoneRequest.
         * @memberof demo
         * @interface IGetUserByPhoneRequest
         * @property {string|null} [phone] GetUserByPhoneRequest phone
         */

        /**
         * Constructs a new GetUserByPhoneRequest.
         * @memberof demo
         * @classdesc Represents a GetUserByPhoneRequest.
         * @implements IGetUserByPhoneRequest
         * @constructor
         * @param {demo.IGetUserByPhoneRequest=} [properties] Properties to set
         */
        function GetUserByPhoneRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetUserByPhoneRequest phone.
         * @member {string} phone
         * @memberof demo.GetUserByPhoneRequest
         * @instance
         */
        GetUserByPhoneRequest.prototype.phone = "";

        /**
         * Creates a new GetUserByPhoneRequest instance using the specified properties.
         * @function create
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {demo.IGetUserByPhoneRequest=} [properties] Properties to set
         * @returns {demo.GetUserByPhoneRequest} GetUserByPhoneRequest instance
         */
        GetUserByPhoneRequest.create = function create(properties) {
            return new GetUserByPhoneRequest(properties);
        };

        /**
         * Encodes the specified GetUserByPhoneRequest message. Does not implicitly {@link demo.GetUserByPhoneRequest.verify|verify} messages.
         * @function encode
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {demo.IGetUserByPhoneRequest} message GetUserByPhoneRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetUserByPhoneRequest.encode = function encode(message, writer, q) {
            if (!writer)
                writer = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.phone);
            return writer;
        };

        /**
         * Encodes the specified GetUserByPhoneRequest message, length delimited. Does not implicitly {@link demo.GetUserByPhoneRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {demo.IGetUserByPhoneRequest} message GetUserByPhoneRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetUserByPhoneRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer && writer.len ? writer.fork() : writer).ldelim();
        };

        /**
         * Decodes a GetUserByPhoneRequest message from the specified reader or buffer.
         * @function decode
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {demo.GetUserByPhoneRequest} GetUserByPhoneRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetUserByPhoneRequest.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var end, message;
            if (length === undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = new $root.demo.GetUserByPhoneRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.phone = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            if (length !== undefined) {
                if (reader.pos !== end)
                    throw RangeError("index out of range");
                reader.len = length;
            }
            return message;
        };

        /**
         * Decodes a GetUserByPhoneRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {demo.GetUserByPhoneRequest} GetUserByPhoneRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetUserByPhoneRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetUserByPhoneRequest message.
         * @function verify
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetUserByPhoneRequest.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                if (!$util.isString(message.phone))
                    return "phone: string expected";
            return null;
        };

        /**
         * Creates a GetUserByPhoneRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {demo.GetUserByPhoneRequest} GetUserByPhoneRequest
         */
        GetUserByPhoneRequest.fromObject = function fromObject(object, long) {
            if (object instanceof $root.demo.GetUserByPhoneRequest)
                return object;
            if (!$util.isObject(object))
                throw TypeError(".demo.GetUserByPhoneRequest: object expected");
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var message = new $root.demo.GetUserByPhoneRequest();
            if (object.phone != null)
                message.phone = String(object.phone);
            return message;
        };

        /**
         * Creates a plain object from a GetUserByPhoneRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {demo.GetUserByPhoneRequest} message GetUserByPhoneRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetUserByPhoneRequest.toObject = function toObject(message, options, q) {
            if (!options)
                options = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var object = {};
            if (options.defaults)
                object.phone = "";
            if (message.phone != null && Object.hasOwnProperty.call(message, "phone"))
                object.phone = message.phone;
            return object;
        };

        /**
         * Converts this GetUserByPhoneRequest to JSON.
         * @function toJSON
         * @memberof demo.GetUserByPhoneRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetUserByPhoneRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetUserByPhoneRequest
         * @function getTypeUrl
         * @memberof demo.GetUserByPhoneRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetUserByPhoneRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/demo.GetUserByPhoneRequest";
        };

        return GetUserByPhoneRequest;
    })();

    demo.UserService = (function() {

        /**
         * Constructs a new UserService service.
         * @memberof demo
         * @classdesc Represents a UserService
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function UserService(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (UserService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = UserService;

        /**
         * Creates new UserService service using the specified rpc implementation.
         * @function create
         * @memberof demo.UserService
         * @static
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         * @returns {UserService} RPC service. Useful where requests and/or responses are streamed.
         */
        UserService.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
        };

        /**
         * Callback as used by {@link demo.UserService#addUser}.
         * @memberof demo.UserService
         * @typedef AddUserCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {demo.User} [response] User
         */

        /**
         * Calls AddUser.
         * @function addUser
         * @memberof demo.UserService
         * @instance
         * @param {demo.IAddUserRequest} request AddUserRequest message or plain object
         * @param {demo.UserService.AddUserCallback} callback Node-style callback called with the error, if any, and User
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(UserService.prototype.addUser = function addUser(request, callback) {
            return $protobuf.rpc.Service.prototype.rpcCall.call(this, addUser, $root.demo.AddUserRequest, $root.demo.User, request, callback);
        }, "name", { value: "AddUser" });

        /**
         * Calls AddUser.
         * @function addUser
         * @memberof demo.UserService
         * @instance
         * @param {demo.IAddUserRequest} request AddUserRequest message or plain object
         * @returns {Promise<demo.User>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link demo.UserService#getUser}.
         * @memberof demo.UserService
         * @typedef GetUserCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {demo.User} [response] User
         */

        /**
         * Calls GetUser.
         * @function getUser
         * @memberof demo.UserService
         * @instance
         * @param {demo.IGetUserRequest} request GetUserRequest message or plain object
         * @param {demo.UserService.GetUserCallback} callback Node-style callback called with the error, if any, and User
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(UserService.prototype.getUser = function getUser(request, callback) {
            return $protobuf.rpc.Service.prototype.rpcCall.call(this, getUser, $root.demo.GetUserRequest, $root.demo.User, request, callback);
        }, "name", { value: "GetUser" });

        /**
         * Calls GetUser.
         * @function getUser
         * @memberof demo.UserService
         * @instance
         * @param {demo.IGetUserRequest} request GetUserRequest message or plain object
         * @returns {Promise<demo.User>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link demo.UserService#getUserByEmail}.
         * @memberof demo.UserService
         * @typedef GetUserByEmailCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {demo.User} [response] User
         */

        /**
         * Calls GetUserByEmail.
         * @function getUserByEmail
         * @memberof demo.UserService
         * @instance
         * @param {demo.IGetUserByEmailRequest} request GetUserByEmailRequest message or plain object
         * @param {demo.UserService.GetUserByEmailCallback} callback Node-style callback called with the error, if any, and User
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(UserService.prototype.getUserByEmail = function getUserByEmail(request, callback) {
            return $protobuf.rpc.Service.prototype.rpcCall.call(this, getUserByEmail, $root.demo.GetUserByEmailRequest, $root.demo.User, request, callback);
        }, "name", { value: "GetUserByEmail" });

        /**
         * Calls GetUserByEmail.
         * @function getUserByEmail
         * @memberof demo.UserService
         * @instance
         * @param {demo.IGetUserByEmailRequest} request GetUserByEmailRequest message or plain object
         * @returns {Promise<demo.User>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link demo.UserService#listUsers}.
         * @memberof demo.UserService
         * @typedef ListUsersCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {demo.ListUsersResponse} [response] ListUsersResponse
         */

        /**
         * Calls ListUsers.
         * @function listUsers
         * @memberof demo.UserService
         * @instance
         * @param {demo.IListUsersRequest} request ListUsersRequest message or plain object
         * @param {demo.UserService.ListUsersCallback} callback Node-style callback called with the error, if any, and ListUsersResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(UserService.prototype.listUsers = function listUsers(request, callback) {
            return $protobuf.rpc.Service.prototype.rpcCall.call(this, listUsers, $root.demo.ListUsersRequest, $root.demo.ListUsersResponse, request, callback);
        }, "name", { value: "ListUsers" });

        /**
         * Calls ListUsers.
         * @function listUsers
         * @memberof demo.UserService
         * @instance
         * @param {demo.IListUsersRequest} request ListUsersRequest message or plain object
         * @returns {Promise<demo.ListUsersResponse>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link demo.UserService#updateUser}.
         * @memberof demo.UserService
         * @typedef UpdateUserCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {demo.User} [response] User
         */

        /**
         * Calls UpdateUser.
         * @function updateUser
         * @memberof demo.UserService
         * @instance
         * @param {demo.IUpdateUserRequest} request UpdateUserRequest message or plain object
         * @param {demo.UserService.UpdateUserCallback} callback Node-style callback called with the error, if any, and User
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(UserService.prototype.updateUser = function updateUser(request, callback) {
            return $protobuf.rpc.Service.prototype.rpcCall.call(this, updateUser, $root.demo.UpdateUserRequest, $root.demo.User, request, callback);
        }, "name", { value: "UpdateUser" });

        /**
         * Calls UpdateUser.
         * @function updateUser
         * @memberof demo.UserService
         * @instance
         * @param {demo.IUpdateUserRequest} request UpdateUserRequest message or plain object
         * @returns {Promise<demo.User>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link demo.UserService#deleteUser}.
         * @memberof demo.UserService
         * @typedef DeleteUserCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {demo.DeleteUserResponse} [response] DeleteUserResponse
         */

        /**
         * Calls DeleteUser.
         * @function deleteUser
         * @memberof demo.UserService
         * @instance
         * @param {demo.IDeleteUserRequest} request DeleteUserRequest message or plain object
         * @param {demo.UserService.DeleteUserCallback} callback Node-style callback called with the error, if any, and DeleteUserResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(UserService.prototype.deleteUser = function deleteUser(request, callback) {
            return $protobuf.rpc.Service.prototype.rpcCall.call(this, deleteUser, $root.demo.DeleteUserRequest, $root.demo.DeleteUserResponse, request, callback);
        }, "name", { value: "DeleteUser" });

        /**
         * Calls DeleteUser.
         * @function deleteUser
         * @memberof demo.UserService
         * @instance
         * @param {demo.IDeleteUserRequest} request DeleteUserRequest message or plain object
         * @returns {Promise<demo.DeleteUserResponse>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link demo.UserService#getUserByPhone}.
         * @memberof demo.UserService
         * @typedef GetUserByPhoneCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {demo.User} [response] User
         */

        /**
         * Calls GetUserByPhone.
         * @function getUserByPhone
         * @memberof demo.UserService
         * @instance
         * @param {demo.IGetUserByPhoneRequest} request GetUserByPhoneRequest message or plain object
         * @param {demo.UserService.GetUserByPhoneCallback} callback Node-style callback called with the error, if any, and User
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(UserService.prototype.getUserByPhone = function getUserByPhone(request, callback) {
            return $protobuf.rpc.Service.prototype.rpcCall.call(this, getUserByPhone, $root.demo.GetUserByPhoneRequest, $root.demo.User, request, callback);
        }, "name", { value: "GetUserByPhone" });

        /**
         * Calls GetUserByPhone.
         * @function getUserByPhone
         * @memberof demo.UserService
         * @instance
         * @param {demo.IGetUserByPhoneRequest} request GetUserByPhoneRequest message or plain object
         * @returns {Promise<demo.User>} Promise
         * @variation 2
         */

        return UserService;
    })();

    return demo;
})();

module.exports = $root;
