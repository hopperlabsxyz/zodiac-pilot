if (window.name === 'transaction-simulator') {
  const node = document.createElement('script')
  node.src = chrome.runtime.getURL('build/inject.js')

  const parent = document.head || document.documentElement
  parent.appendChild(node)
  node.onload = function () {
    node.remove()
  }
}

export {}
