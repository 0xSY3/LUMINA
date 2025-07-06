/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    // Configure headers for Flow CORS support
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ];
    },
    // Webpack configuration for Flow SDK compatibility
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Add fallbacks for Node.js modules (minimal for Flow FCL)
        config.resolve.fallback = {
            ...config.resolve.fallback,
            crypto: false,
            stream: false,
            buffer: false,
            fs: false,
            net: false,
            tls: false,
        };

        return config;
    },
    // Environment variables for Flow networks
    env: {
        FLOW_MAINNET_CHAIN_ID: '747',
        FLOW_TESTNET_CHAIN_ID: '545',
        FLOW_MAINNET_RPC: 'https://mainnet.evm.nodes.onflow.org',
        FLOW_TESTNET_RPC: 'https://testnet.evm.nodes.onflow.org',
    },
    // External packages to be bundled server-side
    serverExternalPackages: ['@onflow/fcl', '@onflow/sdk'],
};

module.exports = nextConfig;