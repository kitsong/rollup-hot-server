'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var commandParser = require('yargs-parser');
var fs = require('fs');
var path = require('path');
var process$1 = require('process');
var rollup = require('rollup');
var url = require('url');
var mime = require('mime');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var commandParser__default = /*#__PURE__*/_interopDefaultLegacy(commandParser);
var mime__default = /*#__PURE__*/_interopDefaultLegacy(mime);

var version = "1.0.1";

const commandAliases = {
    c: 'config',
    s: 'server',
    h: 'help',
    v: 'version',
};
function argvParser(command) {
    const argv = {
        config: '',
        server: '',
        version: false,
        help: false,
    };
    if (command.config && typeof command.config === 'string') {
        argv.config = command.config;
    }
    if (command.server && typeof command.server === 'string') {
        argv.server = command.server;
    }
    if (command.version) {
        argv.version = true;
    }
    if (command.help) {
        argv.help = true;
    }
    return argv;
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

// edit from rollup/cli/run/getConfigPath
function getRollupConfigPath(commandConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const DEFAULT_CONFIG_BASE = 'rollup.config';
        if (commandConfig === '') {
            return path.resolve(yield findConfigFileNameInCwd(DEFAULT_CONFIG_BASE));
        }
        if (commandConfig.slice(0, 5) === 'node:') {
            const pkgName = commandConfig.slice(5);
            try {
                return require.resolve(`rollup-config-${pkgName}`, { paths: [process$1.cwd()] });
            }
            catch (_a) {
                try {
                    return require.resolve(pkgName, { paths: [process$1.cwd()] });
                }
                catch (err) {
                    if (err.code === 'MODULE_NOT_FOUND') {
                        throw new Error(`Could not resolve config file "${commandConfig}"`);
                    }
                    throw err;
                }
            }
        }
        return path.resolve(commandConfig);
    });
}
function getServerConfigPath(commandConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const DEFAULT_CONFIG_BASE = 'server.config';
        if (commandConfig === '') {
            return path.resolve(yield findConfigFileNameInCwd(DEFAULT_CONFIG_BASE));
        }
        return path.resolve(commandConfig);
    });
}
function findConfigFileNameInCwd(configBase) {
    return __awaiter(this, void 0, void 0, function* () {
        const filesInWorkingDir = new Set(yield fs.promises.readdir(process$1.cwd()));
        for (const extension of ['mjs', 'cjs', 'ts']) {
            const fileName = `${configBase}.${extension}`;
            if (filesInWorkingDir.has(fileName))
                return fileName;
        }
        return `${configBase}.js`;
    });
}

function build(inputOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        // create a bundle
        const outputOptions = inputOptions.output;
        const bundle = yield rollup.rollup(inputOptions);
        yield Promise.all(outputOptions.map(bundle.write));
        yield bundle.close();
    });
}

// edit from rollup/cli/run/loadConfigFile
function supportsNativeESM() {
    return Number(/^v(\d+)/.exec(process$1.version)[1]) >= 13;
}
function getDefaultFromCjs(namespace) {
    return namespace.__esModule ? namespace.default : namespace;
}
function loadConfigFile(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const extension = path.extname(fileName);
        const configFileExport = !(extension === '.cjs' || (extension === '.mjs' && supportsNativeESM()))
            ? yield getDefaultFromTranspiledConfigFile(fileName)
            : extension === '.cjs'
                ? getDefaultFromCjs(require(fileName))
                : (yield (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(url.pathToFileURL(fileName).href)).default;
        return getConfigList(configFileExport);
    });
}
function getDefaultFromTranspiledConfigFile(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputOptions = {
            external: (id) => (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json',
            input: fileName,
        };
        const bundle = yield rollup.rollup(inputOptions);
        const { output: [{ code }], } = yield bundle.generate({
            exports: 'named',
            format: 'cjs',
            plugins: [
                {
                    name: 'transpile-import-meta',
                    resolveImportMeta(property, { moduleId }) {
                        if (property === 'url') {
                            return `'${url.pathToFileURL(moduleId).href}'`;
                        }
                        if (property == null) {
                            return `{url:'${url.pathToFileURL(moduleId).href}'}`;
                        }
                    },
                },
            ],
        });
        return loadConfigFromBundledFile(fileName, code);
    });
}
function getConfigList(configFileExport) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield (typeof configFileExport === 'function' ? configFileExport() : configFileExport);
        if (Object.keys(config).length === 0) {
            throw new Error('Config file must export an options object, or an array of options objects');
        }
        return config;
    });
}
function loadConfigFromBundledFile(fileName, bundledCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const resolvedFileName = yield fs.promises.realpath(fileName);
        const extension = path.extname(resolvedFileName);
        const defaultLoader = require.extensions[extension];
        require.extensions[extension] = (module, requiredFileName) => {
            if (requiredFileName === resolvedFileName) {
                module._compile(bundledCode, requiredFileName);
            }
            else {
                if (defaultLoader) {
                    defaultLoader(module, requiredFileName);
                }
            }
        };
        delete require.cache[resolvedFileName];
        try {
            const config = getDefaultFromCjs(require(fileName));
            require.extensions[extension] = defaultLoader;
            return config;
        }
        catch (err) {
            if (err.code === 'ERR_REQUIRE_ESM') {
                throw new Error('Node tried to require an ES module from a CommonJS file, which is not supported');
            }
            throw err;
        }
    });
}

class ServerConfig {
    constructor(config) {
        this.host = config.host || 'localhost';
        this.port = config.port || 8000;
        this.base = config.base || '';
        this.https = config.https || null;
        this.open = config.open || true;
        this.openPath = config.openPath || '';
        this.watch = config.watch || true;
        this.server = config.server || true;
        this.resolve = config.resolve || {};
    }
}
class Server {
    constructor(cf) {
        this.config = cf;
        const { https } = this.config;
        this.close();
        this.server = this.createServer(https);
    }
    listen() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const { port } = this.config;
                    const server = this.server.listen(port, () => {
                        resolve({
                            close() {
                                return __awaiter(this, void 0, void 0, function* () {
                                    yield new Promise(resolve => {
                                        server.close(resolve);
                                    });
                                });
                            },
                        });
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
    close() {
        if (this.server) {
            this.server.close();
        }
        else {
            this.closeServerOnTermination();
        }
    }
    closeServerOnTermination() {
        const terminationSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP'];
        terminationSignals.forEach(signal => {
            process.on(signal, () => {
                if (this.server) {
                    this.server.close();
                    process.exit();
                }
            });
        });
    }
    createServer(https) {
        const requestListener = this.requestListener.bind(this);
        return https ? require('https').createServer(https, requestListener) : require('http').createServer(requestListener);
    }
    requestListener(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { url } = request;
            const queryRE = /\?.*$/s;
            const hashRE = /#.*$/s;
            let path$1 = url.replace(hashRE, '').replace(queryRE, '');
            // resolve base
            path$1 = this.resolveBase(path$1);
            // resolve path
            path$1 = this.resolvePath(path$1);
            // resolve to html
            let filePath = path.resolve('.' + path$1);
            if (path$1.endsWith('/')) {
                filePath = path.resolve(filePath, 'index.html');
            }
            try {
                const fileBuffer = yield fs.promises.readFile(filePath);
                const mineType = mime__default["default"].getType(filePath);
                response.setHeader('Content-Type', mineType);
                response.writeHead(200);
                response.end(fileBuffer, 'utf-8');
            }
            catch (err) {
                response.writeHead(404);
                response.end('404 Not Found' + '\n\n' + filePath, 'utf-8');
            }
        });
    }
    resolvePath(path$1) {
        const { base } = this.config;
        const resolveOption = this.config.resolve;
        for (const key in resolveOption) {
            const target = path.join(base, key);
            if (path$1.indexOf(target) === 0) {
                const result = path.join(base, resolveOption[key]);
                const restPath = path.relative(target, path$1);
                return path.resolve(result, restPath);
            }
        }
        return path$1;
    }
    resolveBase(path$1) {
        const { base } = this.config;
        return path.join(base, path$1);
    }
}

function run(command) {
    return __awaiter(this, void 0, void 0, function* () {
        const { config, server } = command;
        try {
            const loadRollupConfigFile = require('rollup/loadConfigFile');
            const configFile = yield getRollupConfigPath(config);
            const { options, warnings } = yield loadRollupConfigFile(configFile);
            const serverFile = yield getServerConfigPath(server);
            const serverFileConfig = (yield loadConfigFile(serverFile));
            try {
                // build
                for (const inputOptions of options) {
                    yield build(inputOptions);
                }
                const serverConfig = new ServerConfig(serverFileConfig);
                // watch
                if (serverConfig.watch) {
                    rollup.watch(options);
                }
                // server
                if (serverConfig.server) {
                    const server = new Server(serverConfig);
                    yield server.listen();
                }
            }
            catch (err) {
                warnings.flush();
                throw new Error(err);
            }
        }
        catch (err) {
            throw new Error(err);
        }
    });
}

const command = commandParser__default["default"](process.argv.slice(2), {
    alias: commandAliases,
    configuration: { 'camel-case-expansion': false },
});
const argv = argvParser(command);
if (argv.version) {
    console.log(`rollup-hot-server v${version}`);
}
else if (argv.help) {
    console.log('rollup-hot-server help');
}
else {
    run(argv);
}

exports.command = command;
