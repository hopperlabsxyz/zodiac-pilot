import './tabsTracking'
import './sessionTracking'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

export {}
