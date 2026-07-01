/* Initializing Ultraviolet Configuration */
self.__uv$config = {
    /**
     * The prefix for the Ultraviolet service.
     * @type {string}
     */
    prefix: '/uv/service/',

    /**
     * The bare server endpoints to use.
     * Implementing a list for failover logic as requested.
     * @type {string[]}
     */
    bare: [
        'https://tomp.app/',
        'https://uv.student-portal.xyz/bare/',
        'https://bare.astroid.wtf/',
        'https://bare.benroberts.dev/',
    ],

    /**
     * Function to encode the URL.
     * @type {function}
     */
    encodeUrl: Ultraviolet.codec.xor.encode,

    /**
     * Function to decode the URL.
     * @type {function}
     */
    decodeUrl: Ultraviolet.codec.xor.decode,

    /**
     * Path to the handler script.
     * @type {string}
     */
    handler: '/uv/uv.handler.js',

    /**
     * Path to the bundle script.
     * @type {string}
     */
    bundle: '/uv/uv.bundle.js',

    /**
     * Path to the config script itself.
     * @type {string}
     */
    config: '/uv/uv.config.js',

    /**
     * Path to the service worker script.
     * @type {string}
     */
    sw: '/uv/uv.sw.js',
};
