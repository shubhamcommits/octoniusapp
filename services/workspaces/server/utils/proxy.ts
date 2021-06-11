// Config for the proxy   
let config = {}
let proxy

// Check for proxy available   
if (process.env.PROXY_AVAILABLE == 'true') {
    proxy = {
        protocol: process.env.PROXY_PROTOCOL,
        host: process.env.PROXY_HOST,
        port: process.env.PROXY_PORT
    }
    config = {
        proxy: proxy
    }
}

export { config, proxy }
