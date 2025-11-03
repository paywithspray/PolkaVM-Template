import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"

// Conditionally load polkadot plugin to avoid WebSocket initialization during compile/clean/test
// The plugin initializes network connections which require WebSocket setup
// Tests can run on standard Hardhat network without polkadot plugin
const taskName = process.argv[2]
const shouldSkipPlugin = taskName === "compile" || taskName === "clean" || taskName === "test"

// Set up WebSocket polyfill for Node.js if not already defined
if (typeof globalThis.WebSocket === "undefined") {
    const WebSocket = require("ws")
    globalThis.WebSocket = WebSocket as any
}

if (!shouldSkipPlugin) {
    require("@parity/hardhat-polkadot")
}

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    ...(!shouldSkipPlugin && {
        resolc: {
            compilerSource: "npm",
            settings: {
                optimizer: {
                    enabled: true,
                    parameters: 'zstd',
                    fallbackOz: true,
                    runs: 200,
                },
                standardJson: true,
            },
        },
    }),
    networks: {
        hardhat: {
            ...(!shouldSkipPlugin && {
                polkavm: true,
                forking: {
                    url: "https://testnet-passet-hub.polkadot.io",
                },
                adapterConfig: {
                    adapterBinaryPath: "./bin/eth-rpc",
                    dev: true,
                },
            }),
        },
    } as HardhatUserConfig["networks"],
}

export default config
