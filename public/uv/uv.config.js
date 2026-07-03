/* Ultraviolet Configuration */
/* This file is used to configure the Ultraviolet service worker and client. */

self.__uv$config = {
    /**
     * The prefix for the Ultraviolet service.
     * @type {string}
     */
    prefix: '/uv/service/',

    /**
     * The bare server endpoints to use.
     * Note: We use a single string here as required by the UV worker,
     * but we provide a helper to select the best one in the frontend registration.
     * @type {string}
     */
    bare: 'https://tomp.app/',

    /**
     * List of reliable public Bare servers for failover logic.
     */
    bareServers: [
        'https://tomp.app/',
        'https://bare.benroberts.dev/',
        'https://bare.astroid.wtf/',
        'https://uv.student-portal.xyz/bare/'
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
