/* Ultraviolet Configuration */
/* This file is used to configure the Ultraviolet service worker and client. */

const bareServers = [
    'https://tomp.app/',
    'https://bare.benroberts.dev/',
    'https://bare.astroid.wtf/',
    'https://phantom.wcoil.com/bare/',
    'https://bare.z1g.top/'
];

self.__uv$config = {
    prefix: '/uv/service/',
    bare: bareServers[Math.floor(Math.random() * bareServers.length)],
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};
