// Import axios
var axios = require('axios')

// Import Agent
var HttpsProxyAgent = require('https-proxy-agent')

if (process.env.PROXY_AVAILABLE == 'true') {
    
    // Create Agent
    const agent = new HttpsProxyAgent({
        host: process.env.PROXY_HOST,
        port: process.env.PROXY_PORT
    })

    // Update the agent
    axios = axios.create({
        httpsAgent: agent
    })
}


export { axios }
