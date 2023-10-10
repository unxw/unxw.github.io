var Module = typeof Module !== 'undefined' ? Module : {};

if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
    var loadPackage = function(metadata) {

        var PACKAGE_PATH;
        if (typeof window === 'object') {
            PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
        } else if (typeof location !== 'undefined') {
            // worker
            PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
        } else {
            throw 'using preloaded data can only be done on a web page or in a web worker';
        }
        var PACKAGE_NAME = 'build/_emscripten/dist/sonic3air.data';
        var REMOTE_PACKAGE_BASE = 'sonic3air.data';
        if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
            Module['locateFile'] = Module['locateFilePackage'];
            err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
        }
        var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;

        var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];
        var PACKAGE_UUID = metadata['package_uuid'];

        function fetchRemotePackage(packageName, packageSize, callback, errback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', packageName, true);
            xhr.responseType = 'arraybuffer';
            xhr.onprogress = function(event) {
                var url = packageName;
                var size = packageSize;
                if (event.total) size = event.total;
                if (event.loaded) {
                    if (!xhr.addedTotal) {
                        xhr.addedTotal = true;
                        if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
                        Module.dataFileDownloads[url] = {
                            loaded: event.loaded,
                            total: size
                        };
                    } else {
                        Module.dataFileDownloads[url].loaded = event.loaded;
                    }
                    var total = 0;
                    var loaded = 0;
                    var num = 0;
                    for (var download in Module.dataFileDownloads) {
                        var data = Module.dataFileDownloads[download];
                        total += data.total;
                        loaded += data.loaded;
                        num++;
                    }
                    total = Math.ceil(total * Module.expectedDataFileDownloads / num);
                    if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
                } else if (!Module.dataFileDownloads) {
                    if (Module['setStatus']) Module['setStatus']('Downloading data...');
                }
            };
            xhr.onerror = function(event) {
                throw new Error("NetworkError for: " + packageName);
            }
            xhr.onload = function(event) {
                if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
                    var packageData = xhr.response;
                    callback(packageData);
                } else {
                    throw new Error(xhr.statusText + " : " + xhr.responseURL);
                }
            };
            xhr.send(null);
        };

        function handleError(error) {
            console.error('package error:', error);
        };

        function runWithFS() {

            function assert(check, msg) {
                if (!check) throw msg + new Error().stack;
            }
            Module['FS_createPath']('/', 'sonic3air', true, true);
            Module['FS_createPath']('/sonic3air', 'data', true, true);
            Module['FS_createPath']('/sonic3air/data', 'font', true, true);

            /** @constructor */
            function DataRequest(start, end, audio) {
                this.start = start;
                this.end = end;
                this.audio = audio;
            }
            DataRequest.prototype = {
                requests: {},
                open: function(mode, name) {
                    this.name = name;
                    this.requests[name] = this;
                    Module['addRunDependency']('fp ' + this.name);
                },
                send: function() {},
                onload: function() {
                    var byteArray = this.byteArray.subarray(this.start, this.end);
                    this.finish(byteArray);
                },
                finish: function(byteArray) {
                    var that = this;

                    Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
                    Module['removeRunDependency']('fp ' + that.name);

                    this.requests[this.name] = null;
                }
            };

            var files = metadata['files'];
            for (var i = 0; i < files.length; ++i) {
                new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio']).open('GET', files[i]['filename']);
            }


            var indexedDB;
            if (typeof window === 'object') {
                indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            } else if (typeof location !== 'undefined') {
                // worker
                indexedDB = self.indexedDB;
            } else {
                throw 'using IndexedDB to cache data can only be done on a web page or in a web worker';
            }
            var IDB_RO = "readonly";
            var IDB_RW = "readwrite";
            var DB_NAME = "EM_PRELOAD_CACHE";
            var DB_VERSION = 1;
            var METADATA_STORE_NAME = 'METADATA';
            var PACKAGE_STORE_NAME = 'PACKAGES';

            function openDatabase(callback, errback) {
                try {
                    var openRequest = indexedDB.open(DB_NAME, DB_VERSION);
                } catch (e) {
                    return errback(e);
                }
                openRequest.onupgradeneeded = function(event) {
                    var db = event.target.result;

                    if (db.objectStoreNames.contains(PACKAGE_STORE_NAME)) {
                        db.deleteObjectStore(PACKAGE_STORE_NAME);
                    }
                    var packages = db.createObjectStore(PACKAGE_STORE_NAME);

                    if (db.objectStoreNames.contains(METADATA_STORE_NAME)) {
                        db.deleteObjectStore(METADATA_STORE_NAME);
                    }
                    var metadata = db.createObjectStore(METADATA_STORE_NAME);
                };
                openRequest.onsuccess = function(event) {
                    var db = event.target.result;
                    callback(db);
                };
                openRequest.onerror = function(error) {
                    errback(error);
                };
            };

            // This is needed as chromium has a limit on per-entry files in IndexedDB
            // https://cs.chromium.org/chromium/src/content/renderer/indexed_db/webidbdatabase_impl.cc?type=cs&sq=package:chromium&g=0&l=177
            // https://cs.chromium.org/chromium/src/out/Debug/gen/third_party/blink/public/mojom/indexeddb/indexeddb.mojom.h?type=cs&sq=package:chromium&g=0&l=60
            // We set the chunk size to 64MB to stay well-below the limit
            var CHUNK_SIZE = 64 * 1024 * 1024;

            function cacheRemotePackage(
                db,
                packageName,
                packageData,
                packageMeta,
                callback,
                errback
            ) {
                var transactionPackages = db.transaction([PACKAGE_STORE_NAME], IDB_RW);
                var packages = transactionPackages.objectStore(PACKAGE_STORE_NAME);
                var chunkSliceStart = 0;
                var nextChunkSliceStart = 0;
                var chunkCount = Math.ceil(packageData.byteLength / CHUNK_SIZE);
                var finishedChunks = 0;
                for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
                    nextChunkSliceStart += CHUNK_SIZE;
                    var putPackageRequest = packages.put(
                        packageData.slice(chunkSliceStart, nextChunkSliceStart),
                        'package/' + packageName + '/' + chunkId
                    );
                    chunkSliceStart = nextChunkSliceStart;
                    putPackageRequest.onsuccess = function(event) {
                        finishedChunks++;
                        if (finishedChunks == chunkCount) {
                            var transaction_metadata = db.transaction(
                                [METADATA_STORE_NAME],
                                IDB_RW
                            );
                            var metadata = transaction_metadata.objectStore(METADATA_STORE_NAME);
                            var putMetadataRequest = metadata.put({
                                    'uuid': packageMeta.uuid,
                                    'chunkCount': chunkCount
                                },
                                'metadata/' + packageName
                            );
                            putMetadataRequest.onsuccess = function(event) {
                                callback(packageData);
                            };
                            putMetadataRequest.onerror = function(error) {
                                errback(error);
                            };
                        }
                    };
                    putPackageRequest.onerror = function(error) {
                        errback(error);
                    };
                }
            }

            /* Check if there's a cached package, and if so whether it's the latest available */
            function checkCachedPackage(db, packageName, callback, errback) {
                var transaction = db.transaction([METADATA_STORE_NAME], IDB_RO);
                var metadata = transaction.objectStore(METADATA_STORE_NAME);
                var getRequest = metadata.get('metadata/' + packageName);
                getRequest.onsuccess = function(event) {
                    var result = event.target.result;
                    if (!result) {
                        return callback(false, null);
                    } else {
                        return callback(PACKAGE_UUID === result['uuid'], result);
                    }
                };
                getRequest.onerror = function(error) {
                    errback(error);
                };
            }

            function fetchCachedPackage(db, packageName, metadata, callback, errback) {
                var transaction = db.transaction([PACKAGE_STORE_NAME], IDB_RO);
                var packages = transaction.objectStore(PACKAGE_STORE_NAME);

                var chunksDone = 0;
                var totalSize = 0;
                var chunkCount = metadata['chunkCount'];
                var chunks = new Array(chunkCount);

                for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
                    var getRequest = packages.get('package/' + packageName + '/' + chunkId);
                    getRequest.onsuccess = function(event) {
                        // If there's only 1 chunk, there's nothing to concatenate it with so we can just return it now
                        if (chunkCount == 1) {
                            callback(event.target.result);
                        } else {
                            chunksDone++;
                            totalSize += event.target.result.byteLength;
                            chunks.push(event.target.result);
                            if (chunksDone == chunkCount) {
                                if (chunksDone == 1) {
                                    callback(event.target.result);
                                } else {
                                    var tempTyped = new Uint8Array(totalSize);
                                    var byteOffset = 0;
                                    for (var chunkId in chunks) {
                                        var buffer = chunks[chunkId];
                                        tempTyped.set(new Uint8Array(buffer), byteOffset);
                                        byteOffset += buffer.byteLength;
                                        buffer = undefined;
                                    }
                                    chunks = undefined;
                                    callback(tempTyped.buffer);
                                    tempTyped = undefined;
                                }
                            }
                        }
                    };
                    getRequest.onerror = function(error) {
                        errback(error);
                    };
                }
            }

            function processPackageData(arrayBuffer) {
                assert(arrayBuffer, 'Loading data file failed.');
                assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
                var byteArray = new Uint8Array(arrayBuffer);
                var curr;

                // Reuse the bytearray from the XHR as the source for file reads.
                DataRequest.prototype.byteArray = byteArray;

                var files = metadata['files'];
                for (var i = 0; i < files.length; ++i) {
                    DataRequest.prototype.requests[files[i].filename].onload();
                }
                Module['removeRunDependency']('datafile_build/_emscripten/dist/sonic3air.data');

            };
            Module['addRunDependency']('datafile_build/_emscripten/dist/sonic3air.data');

            if (!Module.preloadResults) Module.preloadResults = {};

            function preloadFallback(error) {
                console.error(error);
                console.error('falling back to default preload behavior');
                fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, processPackageData, handleError);
            };

            openDatabase(
                function(db) {
                    checkCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME,
                        function(useCached, metadata) {
                            Module.preloadResults[PACKAGE_NAME] = {
                                fromCache: useCached
                            };
                            if (useCached) {
                                fetchCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME, metadata, processPackageData, preloadFallback);
                            } else {
                                fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE,
                                    function(packageData) {
                                        cacheRemotePackage(db, PACKAGE_PATH + PACKAGE_NAME, packageData, {
                                                uuid: PACKAGE_UUID
                                            }, processPackageData,
                                            function(error) {
                                                console.error(error);
                                                processPackageData(packageData);
                                            });
                                    }, preloadFallback);
                            }
                        }, preloadFallback);
                }, preloadFallback);

            if (Module['setStatus']) Module['setStatus']('Downloading...');

        }
        if (Module['calledRun']) {
            runWithFS();
        } else {
            if (!Module['preRun']) Module['preRun'] = [];
            Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
        }

    }
    loadPackage({
        "files": [{
            "filename": "/sonic3air/config.json",
            "start": 0,
            "end": 578,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/audiodata.bin",
            "start": 578,
            "end": 2290801,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/enginedata.bin",
            "start": 2290801,
            "end": 2366292,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/gamedata.bin",
            "start": 2366292,
            "end": 4645531,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/metadata.json",
            "start": 4645531,
            "end": 4645693,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/freefont_sampled.json",
            "start": 4645693,
            "end": 4647914,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/freefont_sampled.png",
            "start": 4647914,
            "end": 4654544,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/monofont.json",
            "start": 4654544,
            "end": 4656782,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/monofont.png",
            "start": 4656782,
            "end": 4658130,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_light.json",
            "start": 4658130,
            "end": 4659927,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_light.png",
            "start": 4659927,
            "end": 4660968,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_regular.json",
            "start": 4660968,
            "end": 4663214,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_regular.png",
            "start": 4663214,
            "end": 4664935,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_small.json",
            "start": 4664935,
            "end": 4667230,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_small.png",
            "start": 4667230,
            "end": 4668438,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_tiny.json",
            "start": 4668438,
            "end": 4670556,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_tiny.png",
            "start": 4670556,
            "end": 4671506,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_tiny_narrow.json",
            "start": 4671506,
            "end": 4673627,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/oxyfont_tiny_narrow.png",
            "start": 4673627,
            "end": 4674545,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/smallfont.json",
            "start": 4674545,
            "end": 4676100,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/smallfont.png",
            "start": 4676100,
            "end": 4676546,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/sonic3_fontB.json",
            "start": 4676546,
            "end": 4678220,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/sonic3_fontB.png",
            "start": 4678220,
            "end": 4679189,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/sonic3_fontC.json",
            "start": 4679189,
            "end": 4680885,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/font/sonic3_fontC.png",
            "start": 4680885,
            "end": 4682112,
            "audio": 0
        }, {
            "filename": "/sonic3air/data/scripts.bin",
            "start": 4682112,
            "end": 5622042,
            "audio": 0
        }],
        "remote_package_size": 5622042,
        "package_uuid": "b39286b5-8603-4b31-9752-076c1c58c681"
    });

})();