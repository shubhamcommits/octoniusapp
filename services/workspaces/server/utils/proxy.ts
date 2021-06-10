// Config for the proxy   
let config = {}

// Check for proxy available   
if (process.env.PROXY_AVAILABLE == 'true') {
    config = {
        proxy: {
            protocol: process.env.PROXY_PROTOCOL,
            host: process.env.PROXY_HOST,
            port: process.env.PROXY_PORT
        }
    }
}

export { config }
