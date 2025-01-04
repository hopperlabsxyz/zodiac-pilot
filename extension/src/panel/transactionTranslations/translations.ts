import { cowswapSetPreSignature } from './cowswapSetPreSignature'
import { kpkBridgeAware } from './karpatkeyInstitutional/kpkBridgeAware'
import { morphoMulticall } from './morpho/morphoMulticall'
import type { TransactionTranslation } from './types'
import { uniswapMulticall } from './uniswapMulticall'

// ADD ANY NEW TRANSLATIONS TO THIS ARRAY
export const translations: TransactionTranslation[] = [
  morphoMulticall,
  uniswapMulticall,
  cowswapSetPreSignature,
  kpkBridgeAware,
]
