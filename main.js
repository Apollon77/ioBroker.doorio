/**
 *
 * doorio adapter
 *
 */

'use strict';

const utils = require('@iobroker/adapter-core'); // Get common adapter utils
const adapterName = require('./package.json').name.split('.').pop();
let adapter;
let client   = null;

function getAppName() {
    const parts = __dirname.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1].split('.')[0];
}
utils.appName = getAppName();

function startAdapter(options) {
    options = options || {};
    Object.assign(options, {name: adapterName});

    adapter = new utils.Adapter(options);

    adapter.on('message', function (obj) {
        if (obj) processMessage(obj);
        processMessages();
    });

    adapter.on('ready', function () {
        adapter.config.maxTopicLength = 100;
        main();
    });

    adapter.on('unload', function (callback) {
        if (client) client.destroy();
        callback();
    });

    // is called if a subscribed state changes
    adapter.on('stateChange', (id, state) => {
        adapter.log.debug('stateChange ' + id + ': ' + JSON.stringify(state));   
    });
    return adapter;
}

function processMessage(obj) {
    if (!obj || !obj.command) return;
    switch (obj.command) {
        case 'test': {
            // Try to connect to baresip broker
            if (obj.callback && obj.message) {
                const net = require('net');
                const _client = new net.Socket();
                _client.connect(obj.message.port, obj.message.url, function() {});

                // Set timeout for connection
                const timeout = setTimeout(() => {
                    client.destroy();
                    adapter.sendTo(obj.from, obj.command, 'timeout', obj.callback);
                }, 2000);

                // If connected, return success
                _client.on('connect', () => {
                    client.destroy();
                    clearTimeout(timeout);
                    adapter.sendTo(obj.from, obj.command, 'connected', obj.callback);
                });
            }
        }
    }
}

function processMessages() {
    adapter.getMessage((err, obj) => {
        if (obj) {
            processMessage(obj.command, obj.message);
            processMessages();
        }
    });
}

function main() {
    adapter.setObjectNotExists(adapter.namespace + '.input.ring1', {
        type: 'state',
        common: {
            name: 'input.ring1',
            desc: 'doorio send ring1',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true
        },
        native: {}
    });
	
	adapter.setObjectNotExists(adapter.namespace + '.input.ring2', {
        type: 'state',
        common: {
            name: 'input.ring2',
            desc: 'doorio send ring2',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true
        },
        native: {}
    });
	
	adapter.setObjectNotExists(adapter.namespace + '.input.ring3', {
        type: 'state',
        common: {
            name: 'input.ring3',
            desc: 'doorio send ring3',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true
        },
        native: {}
    });
	
	adapter.setObjectNotExists(adapter.namespace + '.input.ring4', {
        type: 'state',
        common: {
            name: 'input.ring4',
            desc: 'doorio send ring4',
            type: 'boolean',
            role: 'state',
            read: true,
            write: true
        },
        native: {}
    });
    
    adapter.subscribeStates('*');
    client = new require(__dirname + '/lib/client')(adapter);
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
