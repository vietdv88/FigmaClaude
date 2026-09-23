"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@otplib/plugin-crypto/index.js
var require_plugin_crypto = __commonJS({
  "node_modules/@otplib/plugin-crypto/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var crypto3 = _interopDefault(require("crypto"));
    var createDigest = (algorithm, hmacKey, counter) => {
      const hmac = crypto3.createHmac(algorithm, Buffer.from(hmacKey, "hex"));
      const digest = hmac.update(Buffer.from(counter, "hex")).digest();
      return digest.toString("hex");
    };
    var createRandomBytes = (size, encoding) => {
      return crypto3.randomBytes(size).toString(encoding);
    };
    exports2.createDigest = createDigest;
    exports2.createRandomBytes = createRandomBytes;
  }
});

// node_modules/thirty-two/lib/thirty-two/thirty-two.js
var require_thirty_two = __commonJS({
  "node_modules/thirty-two/lib/thirty-two/thirty-two.js"(exports2) {
    "use strict";
    var charTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var byteTable = [
      255,
      255,
      26,
      27,
      28,
      29,
      30,
      31,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      255,
      255,
      255,
      255,
      255,
      255,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      255,
      255,
      255,
      255,
      255
    ];
    function quintetCount(buff) {
      var quintets = Math.floor(buff.length / 5);
      return buff.length % 5 === 0 ? quintets : quintets + 1;
    }
    exports2.encode = function(plain) {
      if (!Buffer.isBuffer(plain)) {
        plain = new Buffer(plain);
      }
      var i = 0;
      var j = 0;
      var shiftIndex = 0;
      var digit = 0;
      var encoded = new Buffer(quintetCount(plain) * 8);
      while (i < plain.length) {
        var current = plain[i];
        if (shiftIndex > 3) {
          digit = current & 255 >> shiftIndex;
          shiftIndex = (shiftIndex + 5) % 8;
          digit = digit << shiftIndex | (i + 1 < plain.length ? plain[i + 1] : 0) >> 8 - shiftIndex;
          i++;
        } else {
          digit = current >> 8 - (shiftIndex + 5) & 31;
          shiftIndex = (shiftIndex + 5) % 8;
          if (shiftIndex === 0) i++;
        }
        encoded[j] = charTable.charCodeAt(digit);
        j++;
      }
      for (i = j; i < encoded.length; i++) {
        encoded[i] = 61;
      }
      return encoded;
    };
    exports2.decode = function(encoded) {
      var shiftIndex = 0;
      var plainDigit = 0;
      var plainChar;
      var plainPos = 0;
      if (!Buffer.isBuffer(encoded)) {
        encoded = new Buffer(encoded);
      }
      var decoded = new Buffer(Math.ceil(encoded.length * 5 / 8));
      for (var i = 0; i < encoded.length; i++) {
        if (encoded[i] === 61) {
          break;
        }
        var encodedByte = encoded[i] - 48;
        if (encodedByte < byteTable.length) {
          plainDigit = byteTable[encodedByte];
          if (shiftIndex <= 3) {
            shiftIndex = (shiftIndex + 5) % 8;
            if (shiftIndex === 0) {
              plainChar |= plainDigit;
              decoded[plainPos] = plainChar;
              plainPos++;
              plainChar = 0;
            } else {
              plainChar |= 255 & plainDigit << 8 - shiftIndex;
            }
          } else {
            shiftIndex = (shiftIndex + 5) % 8;
            plainChar |= 255 & plainDigit >>> shiftIndex;
            decoded[plainPos] = plainChar;
            plainPos++;
            plainChar = 255 & plainDigit << 8 - shiftIndex;
          }
        } else {
          throw new Error("Invalid input - it is not base32 encoded string");
        }
      }
      return decoded.slice(0, plainPos);
    };
  }
});

// node_modules/thirty-two/lib/thirty-two/index.js
var require_thirty_two2 = __commonJS({
  "node_modules/thirty-two/lib/thirty-two/index.js"(exports2) {
    var base32 = require_thirty_two();
    exports2.encode = base32.encode;
    exports2.decode = base32.decode;
  }
});

// node_modules/@otplib/plugin-thirty-two/index.js
var require_plugin_thirty_two = __commonJS({
  "node_modules/@otplib/plugin-thirty-two/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var thirtyTwo = _interopDefault(require_thirty_two2());
    var keyDecoder = (encodedSecret, encoding) => {
      return thirtyTwo.decode(encodedSecret).toString(encoding);
    };
    var keyEncoder = (secret, encoding) => {
      return thirtyTwo.encode(Buffer.from(secret, encoding).toString("ascii")).toString().replace(/=/g, "");
    };
    exports2.keyDecoder = keyDecoder;
    exports2.keyEncoder = keyEncoder;
  }
});

// node_modules/@otplib/core/index.js
var require_core = __commonJS({
  "node_modules/@otplib/core/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function objectValues(value) {
      return Object.keys(value).map((key) => value[key]);
    }
    (function(HashAlgorithms) {
      HashAlgorithms["SHA1"] = "sha1";
      HashAlgorithms["SHA256"] = "sha256";
      HashAlgorithms["SHA512"] = "sha512";
    })(exports2.HashAlgorithms || (exports2.HashAlgorithms = {}));
    var HASH_ALGORITHMS = objectValues(exports2.HashAlgorithms);
    (function(KeyEncodings) {
      KeyEncodings["ASCII"] = "ascii";
      KeyEncodings["BASE64"] = "base64";
      KeyEncodings["HEX"] = "hex";
      KeyEncodings["LATIN1"] = "latin1";
      KeyEncodings["UTF8"] = "utf8";
    })(exports2.KeyEncodings || (exports2.KeyEncodings = {}));
    var KEY_ENCODINGS = objectValues(exports2.KeyEncodings);
    (function(Strategy) {
      Strategy["HOTP"] = "hotp";
      Strategy["TOTP"] = "totp";
    })(exports2.Strategy || (exports2.Strategy = {}));
    var STRATEGY = objectValues(exports2.Strategy);
    var createDigestPlaceholder = () => {
      throw new Error("Please provide an options.createDigest implementation.");
    };
    function isTokenValid(value) {
      return /^(\d+)$/.test(value);
    }
    function padStart(value, maxLength, fillString) {
      if (value.length >= maxLength) {
        return value;
      }
      const padding = Array(maxLength + 1).join(fillString);
      return `${padding}${value}`.slice(-1 * maxLength);
    }
    function keyuri(options) {
      const tmpl = `otpauth://${options.type}/{labelPrefix}:{accountName}?secret={secret}{query}`;
      const params = [];
      if (STRATEGY.indexOf(options.type) < 0) {
        throw new Error(`Expecting options.type to be one of ${STRATEGY.join(", ")}. Received ${options.type}.`);
      }
      if (options.type === "hotp") {
        if (options.counter == null || typeof options.counter !== "number") {
          throw new Error('Expecting options.counter to be a number when options.type is "hotp".');
        }
        params.push(`&counter=${options.counter}`);
      }
      if (options.type === "totp" && options.step) {
        params.push(`&period=${options.step}`);
      }
      if (options.digits) {
        params.push(`&digits=${options.digits}`);
      }
      if (options.algorithm) {
        params.push(`&algorithm=${options.algorithm.toUpperCase()}`);
      }
      if (options.issuer) {
        params.push(`&issuer=${encodeURIComponent(options.issuer)}`);
      }
      return tmpl.replace("{labelPrefix}", encodeURIComponent(options.issuer || options.accountName)).replace("{accountName}", encodeURIComponent(options.accountName)).replace("{secret}", options.secret).replace("{query}", params.join(""));
    }
    var OTP = class _OTP {
      constructor(defaultOptions = {}) {
        this._defaultOptions = Object.freeze({
          ...defaultOptions
        });
        this._options = Object.freeze({});
      }
      create(defaultOptions = {}) {
        return new _OTP(defaultOptions);
      }
      clone(defaultOptions = {}) {
        const instance = this.create({
          ...this._defaultOptions,
          ...defaultOptions
        });
        instance.options = this._options;
        return instance;
      }
      get options() {
        return Object.freeze({
          ...this._defaultOptions,
          ...this._options
        });
      }
      set options(options) {
        this._options = Object.freeze({
          ...this._options,
          ...options
        });
      }
      allOptions() {
        return this.options;
      }
      resetOptions() {
        this._options = Object.freeze({});
      }
    };
    function hotpOptionsValidator(options) {
      if (typeof options.createDigest !== "function") {
        throw new Error("Expecting options.createDigest to be a function.");
      }
      if (typeof options.createHmacKey !== "function") {
        throw new Error("Expecting options.createHmacKey to be a function.");
      }
      if (typeof options.digits !== "number") {
        throw new Error("Expecting options.digits to be a number.");
      }
      if (!options.algorithm || HASH_ALGORITHMS.indexOf(options.algorithm) < 0) {
        throw new Error(`Expecting options.algorithm to be one of ${HASH_ALGORITHMS.join(", ")}. Received ${options.algorithm}.`);
      }
      if (!options.encoding || KEY_ENCODINGS.indexOf(options.encoding) < 0) {
        throw new Error(`Expecting options.encoding to be one of ${KEY_ENCODINGS.join(", ")}. Received ${options.encoding}.`);
      }
    }
    var hotpCreateHmacKey = (algorithm, secret, encoding) => {
      return Buffer.from(secret, encoding).toString("hex");
    };
    function hotpDefaultOptions() {
      const options = {
        algorithm: exports2.HashAlgorithms.SHA1,
        createHmacKey: hotpCreateHmacKey,
        createDigest: createDigestPlaceholder,
        digits: 6,
        encoding: exports2.KeyEncodings.ASCII
      };
      return options;
    }
    function hotpOptions(opt) {
      const options = {
        ...hotpDefaultOptions(),
        ...opt
      };
      hotpOptionsValidator(options);
      return Object.freeze(options);
    }
    function hotpCounter(counter) {
      const hexCounter = counter.toString(16);
      return padStart(hexCounter, 16, "0");
    }
    function hotpDigestToToken(hexDigest, digits) {
      const digest = Buffer.from(hexDigest, "hex");
      const offset = digest[digest.length - 1] & 15;
      const binary = (digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255;
      const token = binary % Math.pow(10, digits);
      return padStart(String(token), digits, "0");
    }
    function hotpDigest(secret, counter, options) {
      const hexCounter = hotpCounter(counter);
      const hmacKey = options.createHmacKey(options.algorithm, secret, options.encoding);
      return options.createDigest(options.algorithm, hmacKey, hexCounter);
    }
    function hotpToken(secret, counter, options) {
      const hexDigest = options.digest || hotpDigest(secret, counter, options);
      return hotpDigestToToken(hexDigest, options.digits);
    }
    function hotpCheck(token, secret, counter, options) {
      if (!isTokenValid(token)) {
        return false;
      }
      const systemToken = hotpToken(secret, counter, options);
      return token === systemToken;
    }
    function hotpKeyuri(accountName, issuer, secret, counter, options) {
      return keyuri({
        algorithm: options.algorithm,
        digits: options.digits,
        type: exports2.Strategy.HOTP,
        accountName,
        counter,
        issuer,
        secret
      });
    }
    var HOTP = class _HOTP extends OTP {
      create(defaultOptions = {}) {
        return new _HOTP(defaultOptions);
      }
      allOptions() {
        return hotpOptions(this.options);
      }
      generate(secret, counter) {
        return hotpToken(secret, counter, this.allOptions());
      }
      check(token, secret, counter) {
        return hotpCheck(token, secret, counter, this.allOptions());
      }
      verify(opts) {
        if (typeof opts !== "object") {
          throw new Error("Expecting argument 0 of verify to be an object");
        }
        return this.check(opts.token, opts.secret, opts.counter);
      }
      keyuri(accountName, issuer, secret, counter) {
        return hotpKeyuri(accountName, issuer, secret, counter, this.allOptions());
      }
    };
    function parseWindowBounds(win) {
      if (typeof win === "number") {
        return [Math.abs(win), Math.abs(win)];
      }
      if (Array.isArray(win)) {
        const [past, future] = win;
        if (typeof past === "number" && typeof future === "number") {
          return [Math.abs(past), Math.abs(future)];
        }
      }
      throw new Error("Expecting options.window to be an number or [number, number].");
    }
    function totpOptionsValidator(options) {
      hotpOptionsValidator(options);
      parseWindowBounds(options.window);
      if (typeof options.epoch !== "number") {
        throw new Error("Expecting options.epoch to be a number.");
      }
      if (typeof options.step !== "number") {
        throw new Error("Expecting options.step to be a number.");
      }
    }
    var totpPadSecret = (secret, encoding, minLength) => {
      const currentLength = secret.length;
      const hexSecret = Buffer.from(secret, encoding).toString("hex");
      if (currentLength < minLength) {
        const newSecret = new Array(minLength - currentLength + 1).join(hexSecret);
        return Buffer.from(newSecret, "hex").slice(0, minLength).toString("hex");
      }
      return hexSecret;
    };
    var totpCreateHmacKey = (algorithm, secret, encoding) => {
      switch (algorithm) {
        case exports2.HashAlgorithms.SHA1:
          return totpPadSecret(secret, encoding, 20);
        case exports2.HashAlgorithms.SHA256:
          return totpPadSecret(secret, encoding, 32);
        case exports2.HashAlgorithms.SHA512:
          return totpPadSecret(secret, encoding, 64);
        default:
          throw new Error(`Expecting algorithm to be one of ${HASH_ALGORITHMS.join(", ")}. Received ${algorithm}.`);
      }
    };
    function totpDefaultOptions() {
      const options = {
        algorithm: exports2.HashAlgorithms.SHA1,
        createDigest: createDigestPlaceholder,
        createHmacKey: totpCreateHmacKey,
        digits: 6,
        encoding: exports2.KeyEncodings.ASCII,
        epoch: Date.now(),
        step: 30,
        window: 0
      };
      return options;
    }
    function totpOptions(opt) {
      const options = {
        ...totpDefaultOptions(),
        ...opt
      };
      totpOptionsValidator(options);
      return Object.freeze(options);
    }
    function totpCounter(epoch, step) {
      return Math.floor(epoch / step / 1e3);
    }
    function totpToken(secret, options) {
      const counter = totpCounter(options.epoch, options.step);
      return hotpToken(secret, counter, options);
    }
    function totpEpochsInWindow(epoch, direction, deltaPerEpoch, numOfEpoches) {
      const result = [];
      if (numOfEpoches === 0) {
        return result;
      }
      for (let i = 1; i <= numOfEpoches; i++) {
        const delta = direction * i * deltaPerEpoch;
        result.push(epoch + delta);
      }
      return result;
    }
    function totpEpochAvailable(epoch, step, win) {
      const bounds = parseWindowBounds(win);
      const delta = step * 1e3;
      return {
        current: epoch,
        past: totpEpochsInWindow(epoch, -1, delta, bounds[0]),
        future: totpEpochsInWindow(epoch, 1, delta, bounds[1])
      };
    }
    function totpCheck(token, secret, options) {
      if (!isTokenValid(token)) {
        return false;
      }
      const systemToken = totpToken(secret, options);
      return token === systemToken;
    }
    function totpCheckByEpoch(epochs, token, secret, options) {
      let position = null;
      epochs.some((epoch, idx) => {
        if (totpCheck(token, secret, {
          ...options,
          epoch
        })) {
          position = idx + 1;
          return true;
        }
        return false;
      });
      return position;
    }
    function totpCheckWithWindow(token, secret, options) {
      if (totpCheck(token, secret, options)) {
        return 0;
      }
      const epochs = totpEpochAvailable(options.epoch, options.step, options.window);
      const backward = totpCheckByEpoch(epochs.past, token, secret, options);
      if (backward !== null) {
        return backward * -1;
      }
      return totpCheckByEpoch(epochs.future, token, secret, options);
    }
    function totpTimeUsed(epoch, step) {
      return Math.floor(epoch / 1e3) % step;
    }
    function totpTimeRemaining(epoch, step) {
      return step - totpTimeUsed(epoch, step);
    }
    function totpKeyuri(accountName, issuer, secret, options) {
      return keyuri({
        algorithm: options.algorithm,
        digits: options.digits,
        step: options.step,
        type: exports2.Strategy.TOTP,
        accountName,
        issuer,
        secret
      });
    }
    var TOTP = class _TOTP extends HOTP {
      create(defaultOptions = {}) {
        return new _TOTP(defaultOptions);
      }
      allOptions() {
        return totpOptions(this.options);
      }
      generate(secret) {
        return totpToken(secret, this.allOptions());
      }
      checkDelta(token, secret) {
        return totpCheckWithWindow(token, secret, this.allOptions());
      }
      check(token, secret) {
        const delta = this.checkDelta(token, secret);
        return typeof delta === "number";
      }
      verify(opts) {
        if (typeof opts !== "object") {
          throw new Error("Expecting argument 0 of verify to be an object");
        }
        return this.check(opts.token, opts.secret);
      }
      timeRemaining() {
        const options = this.allOptions();
        return totpTimeRemaining(options.epoch, options.step);
      }
      timeUsed() {
        const options = this.allOptions();
        return totpTimeUsed(options.epoch, options.step);
      }
      keyuri(accountName, issuer, secret) {
        return totpKeyuri(accountName, issuer, secret, this.allOptions());
      }
    };
    function authenticatorOptionValidator(options) {
      totpOptionsValidator(options);
      if (typeof options.keyDecoder !== "function") {
        throw new Error("Expecting options.keyDecoder to be a function.");
      }
      if (options.keyEncoder && typeof options.keyEncoder !== "function") {
        throw new Error("Expecting options.keyEncoder to be a function.");
      }
    }
    function authenticatorDefaultOptions() {
      const options = {
        algorithm: exports2.HashAlgorithms.SHA1,
        createDigest: createDigestPlaceholder,
        createHmacKey: totpCreateHmacKey,
        digits: 6,
        encoding: exports2.KeyEncodings.HEX,
        epoch: Date.now(),
        step: 30,
        window: 0
      };
      return options;
    }
    function authenticatorOptions(opt) {
      const options = {
        ...authenticatorDefaultOptions(),
        ...opt
      };
      authenticatorOptionValidator(options);
      return Object.freeze(options);
    }
    function authenticatorEncoder(secret, options) {
      return options.keyEncoder(secret, options.encoding);
    }
    function authenticatorDecoder(secret, options) {
      return options.keyDecoder(secret, options.encoding);
    }
    function authenticatorGenerateSecret(numberOfBytes, options) {
      const key = options.createRandomBytes(numberOfBytes, options.encoding);
      return authenticatorEncoder(key, options);
    }
    function authenticatorToken(secret, options) {
      return totpToken(authenticatorDecoder(secret, options), options);
    }
    function authenticatorCheckWithWindow(token, secret, options) {
      return totpCheckWithWindow(token, authenticatorDecoder(secret, options), options);
    }
    var Authenticator = class _Authenticator extends TOTP {
      create(defaultOptions = {}) {
        return new _Authenticator(defaultOptions);
      }
      allOptions() {
        return authenticatorOptions(this.options);
      }
      generate(secret) {
        return authenticatorToken(secret, this.allOptions());
      }
      checkDelta(token, secret) {
        return authenticatorCheckWithWindow(token, secret, this.allOptions());
      }
      encode(secret) {
        return authenticatorEncoder(secret, this.allOptions());
      }
      decode(secret) {
        return authenticatorDecoder(secret, this.allOptions());
      }
      generateSecret(numberOfBytes = 10) {
        return authenticatorGenerateSecret(numberOfBytes, this.allOptions());
      }
    };
    exports2.Authenticator = Authenticator;
    exports2.HASH_ALGORITHMS = HASH_ALGORITHMS;
    exports2.HOTP = HOTP;
    exports2.KEY_ENCODINGS = KEY_ENCODINGS;
    exports2.OTP = OTP;
    exports2.STRATEGY = STRATEGY;
    exports2.TOTP = TOTP;
    exports2.authenticatorCheckWithWindow = authenticatorCheckWithWindow;
    exports2.authenticatorDecoder = authenticatorDecoder;
    exports2.authenticatorDefaultOptions = authenticatorDefaultOptions;
    exports2.authenticatorEncoder = authenticatorEncoder;
    exports2.authenticatorGenerateSecret = authenticatorGenerateSecret;
    exports2.authenticatorOptionValidator = authenticatorOptionValidator;
    exports2.authenticatorOptions = authenticatorOptions;
    exports2.authenticatorToken = authenticatorToken;
    exports2.createDigestPlaceholder = createDigestPlaceholder;
    exports2.hotpCheck = hotpCheck;
    exports2.hotpCounter = hotpCounter;
    exports2.hotpCreateHmacKey = hotpCreateHmacKey;
    exports2.hotpDefaultOptions = hotpDefaultOptions;
    exports2.hotpDigestToToken = hotpDigestToToken;
    exports2.hotpKeyuri = hotpKeyuri;
    exports2.hotpOptions = hotpOptions;
    exports2.hotpOptionsValidator = hotpOptionsValidator;
    exports2.hotpToken = hotpToken;
    exports2.isTokenValid = isTokenValid;
    exports2.keyuri = keyuri;
    exports2.objectValues = objectValues;
    exports2.padStart = padStart;
    exports2.totpCheck = totpCheck;
    exports2.totpCheckByEpoch = totpCheckByEpoch;
    exports2.totpCheckWithWindow = totpCheckWithWindow;
    exports2.totpCounter = totpCounter;
    exports2.totpCreateHmacKey = totpCreateHmacKey;
    exports2.totpDefaultOptions = totpDefaultOptions;
    exports2.totpEpochAvailable = totpEpochAvailable;
    exports2.totpKeyuri = totpKeyuri;
    exports2.totpOptions = totpOptions;
    exports2.totpOptionsValidator = totpOptionsValidator;
    exports2.totpPadSecret = totpPadSecret;
    exports2.totpTimeRemaining = totpTimeRemaining;
    exports2.totpTimeUsed = totpTimeUsed;
    exports2.totpToken = totpToken;
  }
});

// node_modules/@otplib/preset-default/index.js
var require_preset_default = __commonJS({
  "node_modules/@otplib/preset-default/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var pluginCrypto = require_plugin_crypto();
    var pluginThirtyTwo = require_plugin_thirty_two();
    var core = require_core();
    var hotp = new core.HOTP({
      createDigest: pluginCrypto.createDigest
    });
    var totp = new core.TOTP({
      createDigest: pluginCrypto.createDigest
    });
    var authenticator2 = new core.Authenticator({
      createDigest: pluginCrypto.createDigest,
      createRandomBytes: pluginCrypto.createRandomBytes,
      keyDecoder: pluginThirtyTwo.keyDecoder,
      keyEncoder: pluginThirtyTwo.keyEncoder
    });
    exports2.authenticator = authenticator2;
    exports2.hotp = hotp;
    exports2.totp = totp;
  }
});

// node_modules/otplib/index.js
var require_otplib = __commonJS({
  "node_modules/otplib/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var presetDefault = require_preset_default();
    Object.keys(presetDefault).forEach(function(k) {
      if (k !== "default") Object.defineProperty(exports2, k, {
        enumerable: true,
        get: function() {
          return presetDefault[k];
        }
      });
    });
  }
});

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.6.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var os = require("os");
    var crypto3 = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse2(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs2.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs2.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs2.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (debug || !quiet) {
        const keysCount = Object.keys(parsedAll).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path2.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt2(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto3.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt: decrypt2,
      parse: parse2,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// src/figma-login.ts
var import_playwright_core = require("playwright-core");
var import_otplib = __toESM(require_otplib());
var crypto2 = __toESM(require("crypto"));
var fs = __toESM(require("fs"));
var dotenv = __toESM(require_main());
var path = __toESM(require("path"));

// src/github-store.ts
var crypto = __toESM(require("crypto"));
var _KEY = crypto.createHash("sha256").update("F1gm@L0g1nT00l-2026-M1SA").digest();
var MARKER_START = "@@FIGMA_COOKIES_V1_START@@";
var MARKER_END = "@@FIGMA_COOKIES_V1_END@@";
function encrypt(plain) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", _KEY, iv);
  let enc = cipher.update(plain, "utf8", "base64");
  enc += cipher.final("base64");
  return iv.toString("hex") + ":" + enc;
}
function decrypt(raw) {
  const sep = raw.indexOf(":");
  const iv = Buffer.from(raw.slice(0, sep), "hex");
  const enc = raw.slice(sep + 1);
  const decipher = crypto.createDecipheriv("aes-256-cbc", _KEY, iv);
  let dec = decipher.update(enc, "base64", "utf8");
  dec += decipher.final("utf8");
  return dec;
}
function githubConfig() {
  return {
    token: process.env.GITHUB_TOKEN ?? "",
    repo: process.env.GITHUB_REPO ?? "",
    branch: process.env.GITHUB_BRANCH ?? "main",
    filePath: process.env.GITHUB_FILE_PATH ?? "cookies.enc"
  };
}
function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "figma-login-tool",
    "Content-Type": "application/json"
  };
}
async function fetchCookiesFromGitHub() {
  const { token, repo, branch, filePath } = githubConfig();
  if (!token || !repo) return {};
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const res = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers: githubHeaders(token) });
  if (!res.ok) {
    if (res.status === 404) return {};
    throw new Error(`[GitHub] Loi doc file cu (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  if (!data.content) return {};
  const fileContent = Buffer.from(data.content, "base64").toString("utf8");
  const start = fileContent.indexOf(MARKER_START);
  const end = fileContent.indexOf(MARKER_END);
  if (start === -1 || end === -1) return {};
  const plain = decrypt(fileContent.slice(start + MARKER_START.length, end));
  const payload = JSON.parse(plain);
  return payload.accounts ?? {};
}
async function isSessionValid(cookies) {
  if (!cookies.length) return false;
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    const res = await fetch("https://www.figma.com/files/recent", {
      headers: { Cookie: cookieHeader },
      redirect: "manual"
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location") ?? "";
      return !location.includes("/login");
    }
    return res.status === 200;
  } catch {
    return false;
  }
}
async function saveCookiesToGitHub(cookiesByEmail) {
  const { token, repo, branch, filePath } = githubConfig();
  if (!token || !repo) {
    console.error("[GitHub] Thieu GITHUB_TOKEN hoac GITHUB_REPO trong config, bo qua buoc luu cookie.");
    return;
  }
  const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const payload = {
    updatedAt: now.toISOString(),
    accounts: cookiesByEmail
  };
  const encrypted = encrypt(JSON.stringify(payload, null, 2));
  const fileContent = MARKER_START + encrypted + MARKER_END;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const headers = githubHeaders(token);
  console.log(`[GitHub] Kiem tra file "${filePath}" tren ${repo}...`);
  let sha;
  const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
  if (getRes.ok) {
    sha = (await getRes.json()).sha;
  } else if (getRes.status !== 404) {
    throw new Error(`[GitHub] Loi kiem tra file (${getRes.status}): ${await getRes.text()}`);
  }
  const accountCount = Object.keys(cookiesByEmail).length;
  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `Cap nhat cookie Figma (${accountCount} tai khoan) - ${now.toISOString()}`,
      content: Buffer.from(fileContent, "utf8").toString("base64"),
      branch,
      ...sha ? { sha } : {}
    })
  });
  if (!putRes.ok) {
    throw new Error(`[GitHub] Loi ghi file (${putRes.status}): ${await putRes.text()}`);
  }
  console.log(`[GitHub] Da luu cookie cua ${accountCount} tai khoan vao "${filePath}" (nhanh ${branch}).`);
  console.log(`[GitHub] URL: https://github.com/${repo}/blob/${branch}/${filePath}`);
}

// src/figma-login.ts
var ROOT = process.pkg ? path.dirname(process.execPath) : fs.existsSync(path.join(__dirname, "config.enc")) ? __dirname : path.resolve(__dirname, "..");
var LOCK_FILE = path.join(ROOT, "figma-login.lock");
var LOCK_TIMEOUT_MS = 30 * 60 * 1e3;
function acquireLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const stats = fs.statSync(LOCK_FILE);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < LOCK_TIMEOUT_MS) {
      const startedAt = new Date(stats.mtimeMs).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
      console.error(`
[LOI] Chuong trinh dang duoc chay boi nguoi khac (bat dau luc ${startedAt}).`);
      console.error("Vui long doi cho den khi hoan thanh roi thu lai.");
      process.exit(1);
    }
    console.log("[WARN] Phat hien lock file cu (> 30 phut), bo qua va tiep tuc...");
    fs.unlinkSync(LOCK_FILE);
  }
  fs.writeFileSync(LOCK_FILE, (/* @__PURE__ */ new Date()).toISOString(), "utf8");
}
function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  } catch {
  }
}
var _KEY2 = crypto2.createHash("sha256").update("F1gm@L0g1nT00l-2026-M1SA").digest();
function loadConfig() {
  const encPath = path.join(ROOT, "config.enc");
  const envPath = path.join(ROOT, ".env");
  if (fs.existsSync(encPath)) {
    const raw = fs.readFileSync(encPath, "utf8").trim();
    const colon = raw.indexOf(":");
    const iv = Buffer.from(raw.slice(0, colon), "hex");
    const enc = raw.slice(colon + 1);
    const dec = crypto2.createDecipheriv("aes-256-cbc", _KEY2, iv);
    let plain = dec.update(enc, "base64", "utf8");
    plain += dec.final("utf8");
    const parsed = dotenv.parse(plain);
    for (const [k, v] of Object.entries(parsed)) process.env[k] = v;
  } else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    console.error("Khong tim thay config.enc hoac .env!");
    process.exit(1);
  }
}
loadConfig();
function loadAccounts() {
  const emails = (process.env.FIGMA_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const passwords = (process.env.FIGMA_PASSWORDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const secrets = (process.env.FIGMA_2FA_SECRETS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!emails.length) {
    console.error("Thieu FIGMA_EMAILS trong config");
    process.exit(1);
  }
  if (passwords.length !== emails.length || secrets.length !== emails.length) {
    console.error("So luong FIGMA_EMAILS / FIGMA_PASSWORDS / FIGMA_2FA_SECRETS phai bang nhau.");
    process.exit(1);
  }
  return emails.map((email, i) => ({ email, password: passwords[i], totpSecret: secrets[i] }));
}
var accounts = loadAccounts();
var sameSiteMap = { Strict: "strict", Lax: "lax", None: "no_restriction" };
async function loginAccount(browser, account) {
  const { email, password, totpSecret } = account;
  const tag = `[${email.split("@")[0]}]`;
  let context = null;
  try {
    context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    console.log(`${tag} Truy cap figma.com/login...`);
    const loginResponse = await page.goto("https://www.figma.com/login", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    let clockDriftMs = 0;
    const serverDateHeader = loginResponse?.headers()["date"];
    if (serverDateHeader) {
      const serverTimeMs = new Date(serverDateHeader).getTime();
      if (!Number.isNaN(serverTimeMs)) {
        clockDriftMs = serverTimeMs - Date.now();
        if (Math.abs(clockDriftMs) > 5e3) {
          console.log(`${tag} [WARN] Dong ho may lech ~${Math.round(clockDriftMs / 1e3)}s so voi server, da tu bu tru.`);
        }
      }
    }
    console.log(`${tag} Dien email va password...`);
    await page.locator('input[type="email"], input[name="email"]').first().fill(email);
    await page.locator('input[type="password"], input[name="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3e3);
    const bodyText = await page.locator("body").textContent() ?? "";
    if (bodyText.toLowerCase().includes("authentication code") || bodyText.toLowerCase().includes("recovery code")) {
      console.log(`${tag} Man 2FA - generate OTP...`);
      import_otplib.authenticator.options = { epoch: Date.now() + clockDriftMs };
      const otp = import_otplib.authenticator.generate(totpSecret);
      const otpBoxes = page.getByRole("textbox");
      const boxCount = await otpBoxes.count();
      console.log(`${tag} [DEBUG] OTP=${otp}, tim thay ${boxCount} o nhap.`);
      if (boxCount === otp.length) {
        for (let i = 0; i < otp.length; i++) {
          await otpBoxes.nth(i).fill(otp[i]);
        }
      } else {
        await otpBoxes.first().fill(otp);
      }
      await page.waitForTimeout(300);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 15e3 }).catch(() => {
      });
    }
    const finalUrl = page.url();
    if (!finalUrl.includes("/login")) {
      console.log(`${tag} Dang nhap thanh cong!`);
      const rawCookies = await context.cookies();
      const cookies = rawCookies.map((c) => {
        const isSession = !c.expires || c.expires <= 0;
        const row = {
          domain: c.domain,
          hostOnly: !c.domain.startsWith("."),
          httpOnly: c.httpOnly,
          name: c.name,
          path: c.path,
          sameSite: c.sameSite ? sameSiteMap[c.sameSite] ?? c.sameSite.toLowerCase() : null,
          secure: c.secure,
          session: isSession,
          storeId: null,
          value: c.value
        };
        if (!isSession) row.expirationDate = c.expires;
        return row;
      });
      console.log(`${tag} Lay duoc ${cookies.length} cookies.`);
      return { account, cookies, success: true };
    } else {
      const errMsg = await page.locator('[role="alert"], [class*="error"]').first().textContent({ timeout: 2e3 }).catch(() => "");
      const msg = errMsg?.trim() || `Dang nhap that bai (URL: ${finalUrl})`;
      console.error(`${tag} THAT BAI: ${msg}`);
      return { account, cookies: [], success: false, error: msg };
    }
  } catch (err) {
    console.error(`${tag} LOI: ${err?.message ?? err}`);
    return { account, cookies: [], success: false, error: err?.message ?? String(err) };
  } finally {
    await context?.close();
  }
}
async function main() {
  acquireLock();
  let browser = null;
  try {
    console.log("Kiem tra cookie hien co tren GitHub...");
    const existing = await fetchCookiesFromGitHub().catch((err) => {
      console.warn(`[WARN] Khong doc duoc cookie cu tren GitHub (${err.message}), se dang nhap lai tat ca.`);
      return {};
    });
    const reused = {};
    const toRelogin = [];
    for (const acc of accounts) {
      const tag = `[${acc.email.split("@")[0]}]`;
      const cached = existing[acc.email];
      if (cached && await isSessionValid(cached)) {
        console.log(`${tag} Cookie cu van con hoat dong, bo qua dang nhap lai.`);
        reused[acc.email] = cached;
      } else {
        console.log(`${tag} Cookie cu da het han hoac chua co, can dang nhap lai.`);
        toRelogin.push(acc);
      }
    }
    let results = [];
    if (toRelogin.length > 0) {
      console.log(`
Khoi dong Chrome, dang nhap ${toRelogin.length}/${accounts.length} tai khoan...
`);
      browser = await import_playwright_core.chromium.launch({ channel: "chrome", headless: false, slowMo: 100 });
      results = await Promise.all(toRelogin.map((a) => loginAccount(browser, a)));
    } else {
      console.log("\nTat ca cookie hien co deu con hoat dong, khong can dang nhap lai tai khoan nao.\n");
    }
    const successful = results.filter((r) => r.success);
    const cookiesByEmail = { ...reused };
    for (const r of successful) cookiesByEmail[r.account.email] = r.cookies;
    if (Object.keys(cookiesByEmail).length > 0) {
      console.log(`
[GitHub] Luu ${Object.keys(cookiesByEmail).length} tai khoan...
`);
      await saveCookiesToGitHub(cookiesByEmail);
    }
    const failed = results.filter((r) => !r.success);
    const okCount = Object.keys(cookiesByEmail).length;
    console.log("\n" + "=".repeat(60));
    console.log(
      `HOAN THANH: ${okCount}/${accounts.length} tai khoan co cookie hop le (${Object.keys(reused).length} tai su dung lai, ${successful.length} vua dang nhap moi).`
    );
    if (failed.length > 0) {
      console.log(`THAT BAI (${failed.length}): ${failed.map((r) => r.account.email.split("@")[0]).join(", ")}`);
    }
    console.log("=".repeat(60));
    process.exitCode = failed.length > 0 ? 1 : 0;
  } catch (err) {
    const msg = err?.message ?? String(err);
    if (msg.includes("chrome") || msg.includes("Chromium") || msg.includes("executable")) {
      console.error("\n[LOI] Khong tim thay Google Chrome. Cai dat tai: https://www.google.com/chrome");
    } else {
      console.error("\n[LOI]", msg);
    }
    process.exitCode = 1;
  } finally {
    releaseLock();
    await browser?.close();
  }
}
process.on("uncaughtException", (err) => {
  console.error("\n[LOI KHOI DONG]", err.message ?? err);
  releaseLock();
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("\n[LOI KHONG XU LY DUOC]", reason);
  releaseLock();
  process.exit(1);
});
main();
/*! Bundled license information:

@otplib/plugin-crypto/index.js:
  (**
   * @otplib/plugin-crypto
   *
   * @author Gerald Yeo <contact@fusedthought.com>
   * @version: 12.0.1
   * @license: MIT
   **)

@otplib/plugin-thirty-two/index.js:
  (**
   * @otplib/plugin-thirty-two
   *
   * @author Gerald Yeo <contact@fusedthought.com>
   * @version: 12.0.1
   * @license: MIT
   **)

@otplib/core/index.js:
  (**
   * @otplib/core
   *
   * @author Gerald Yeo <contact@fusedthought.com>
   * @version: 12.0.1
   * @license: MIT
   **)

@otplib/preset-default/index.js:
  (**
   * @otplib/preset-default
   *
   * @author Gerald Yeo <contact@fusedthought.com>
   * @version: 12.0.1
   * @license: MIT
   **)

otplib/index.js:
  (**
   * otplib
   *
   * @author Gerald Yeo <contact@fusedthought.com>
   * @version: 12.0.1
   * @license: MIT
   **)
*/
