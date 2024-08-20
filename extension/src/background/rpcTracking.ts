import { activeExtensionTabs } from './tabsTracking'

// Keep track of the network IDs for all JSON RPC endpoints used from apps
export const networkIdOfRpcUrl = new Map<string, number | undefined>()
const networkIdOfRpcUrlPromise = new Map<string, Promise<number | undefined>>()

const detectNetworkOfRpcUrl = async (url: string, tabId: number) => {
  if (!networkIdOfRpcUrlPromise.has(url)) {
    const promise = new Promise<number | undefined>((resolve) => {
      // fetch from the injected script, so the request has the apps origin (otherwise the request may be blocked by the RPC provider)
      chrome.tabs.sendMessage(tabId, { type: 'requestChainId', url }, resolve)
    })

    networkIdOfRpcUrlPromise.set(url, promise)
  }

  const result = await networkIdOfRpcUrlPromise.get(url)
  if (!networkIdOfRpcUrl.has(url)) {
    networkIdOfRpcUrl.set(url, result)
    console.debug(
      `detected network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`
    )
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  (details: chrome.webRequest.WebRequestBodyDetails) => {
    // only handle requests in tracked tabs
    if (!activeExtensionTabs.has(details.tabId)) return
    // skip urls we already know
    if (!networkIdOfRpcUrlPromise.has(details.url)) return
    // only consider POST requests
    if (details.method !== 'POST') return
    // ignore requests to fork RPCs
    if (details.url.startsWith('https://virtual.mainnet.rpc.tenderly.co/'))
      return

    // only consider requests with a JSON RPC body
    if (!getJsonRpcBody(details)) return

    detectNetworkOfRpcUrl(details.url, details.tabId)
  },
  {
    urls: ['<all_urls>'],
    types: ['xmlhttprequest'],
  },
  ['requestBody']
)

const decoder = new TextDecoder('utf-8')
const getJsonRpcBody = (details: chrome.webRequest.WebRequestBodyDetails) => {
  const bytes = details.requestBody?.raw?.[0]?.bytes
  if (!bytes) return undefined

  let json
  try {
    json = JSON.parse(decodeURIComponent(decoder.decode(bytes)))
  } catch (e) {
    return undefined
  }

  const probeRpc = Array.isArray(json) ? json[0] : json
  if (probeRpc && probeRpc.jsonrpc !== '2.0') {
    return undefined
  }

  return json
}
