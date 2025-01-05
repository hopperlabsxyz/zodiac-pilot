import type { HexAddress } from '@/types'
import { MarketParams } from '@morpho-org/blue-sdk'

import { getReadOnlyProvider } from '@/providers'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { fetchMarketFromConfig } from '@morpho-org/blue-sdk-ethers'
import { FunctionFragment, Result } from 'ethers'
import { UnfoldVertical } from 'lucide-react'
import type { TransactionTranslation } from '../types'
import { unwrapMulticall } from '../utils'
import {
  erc4626Interface,
  morphoBundlerInterface,
  morphoInterface,
  publicAllocatorInterface,
} from './interfaces'
import type { BundlerCallHandler } from './type'
import { addOnePercent, createContract } from './utils'

const CHAIN_AGNOSTIC_BUNDLER_V2 = '0x23055618898e202386e6c13955a58D3C68200BFB'
const ETHEREUM_BUNDLER_V2 = '0x4095F064B8d3c3548A3bebfd0Bbfd04750E30077'
const MORPHO = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb'

const MORPHO_SUPPORTED_NETWORK: Record<number, string> = {
  1: 'mainnet',
  8453: 'base',
}

export const morphoMulticall = {
  title: 'Unfold individual calls',
  icon: UnfoldVertical,
  recommendedFor: [KnownContracts.ROLES_V1, KnownContracts.ROLES_V2],

  translate: async (transaction, chainId, avatarAddress) => {
    const { data, value, to } = transaction

    if (!MORPHO_SUPPORTED_NETWORK[chainId]) {
      // not on a network where Morpho is deployed
      return undefined
    }

    if (
      to.toLowerCase() !== CHAIN_AGNOSTIC_BUNDLER_V2.toLowerCase() &&
      to.toLowerCase() !== ETHEREUM_BUNDLER_V2.toLowerCase()
    ) {
      // not a call to Morpho Bundler
      return undefined
    }

    if (!data) {
      return undefined
    }

    if (value > 0) {
      // We don't support unfolding of transactions with value since it's hard to tell which individual calls are supposed to receive the value
      return undefined
    }

    const unwrappedCalls = unwrapMulticall(data)

    const functionCalls: {
      to: HexAddress
      data: HexAddress
      value: bigint
    }[] = []

    for (const c of unwrappedCalls) {
      for (const fragment of morphoBundlerInterface.fragments) {
        if (fragment.type !== 'function') continue
        try {
          // reverts if the call is not part of morphoBundlerInterface
          const params = morphoBundlerInterface.decodeFunctionData(
            fragment as FunctionFragment,
            c,
          )
          const fragmentName = (fragment as FunctionFragment).name
          functionCalls.push(
            ...(await convertMorphoBundlerCall[fragmentName]({
              transaction,
              chainId,
              avatarAddress,
              params,
            })),
          )
        } catch {
          continue
        }
      }
    }

    if (functionCalls.length === 0) {
      return undefined
    }

    return functionCalls
  },
} satisfies TransactionTranslation

const convertMorphoBundlerCall: Record<string, BundlerCallHandler> = {
  erc4626Mint: async ({ chainId, params }) => {
    const metaMorpho = createContract(params[0], erc4626Interface, chainId)
    const underlyingAddress = await metaMorpho.asset()
    const amount = addOnePercent(await metaMorpho.convertToAssets(params[1])) // `params[1]` shares

    const approveCall = erc4626Interface.encodeFunctionData('approve', [
      params[0], // vault address
      amount,
    ]) as HexAddress

    const mintCall = erc4626Interface.encodeFunctionData('mint', [
      params[1], // shares
      params[3], // receiver
    ]) as HexAddress

    return [
      {
        to: underlyingAddress,
        data: approveCall,
        value: 0n,
      },
      {
        to: params[0], // vault address
        data: mintCall,
        value: 0n,
      },
    ]
  },
  erc4626Deposit: async ({ chainId, params }) => {
    const metaMorpho = createContract(params[0], erc4626Interface, chainId)
    const underlyingAddress = await metaMorpho.asset()

    const approveCall = erc4626Interface.encodeFunctionData('approve', [
      params[0], // vault address
      params[1], // amount
    ]) as HexAddress

    const depositCall = erc4626Interface.encodeFunctionData('deposit', [
      params[1], // assets
      params[3], // receiver
    ]) as HexAddress

    return [
      {
        to: underlyingAddress,
        data: approveCall,
        value: 0n,
      },
      {
        to: params[0], // vault address
        data: depositCall,
        value: 0n,
      },
    ]
  },
  erc4626Redeem: async ({ params }) => {
    const redeemCall = erc4626Interface.encodeFunctionData('redeem', [
      params[1], // shares
      params[3], // receiver
      params[4], // owner
    ]) as HexAddress
    return [
      {
        to: params[0], // vault address
        data: redeemCall,
        value: 0n,
      },
    ]
  },
  erc4626Withdraw: async ({ params }) => {
    const newData = erc4626Interface.encodeFunctionData('withdraw', [
      params[1], // assets
      params[3], // receiver
      params[4], // owner
    ]) as HexAddress
    return [
      {
        to: params[0], // vault address
        data: newData,
        value: 0n,
      },
    ]
  },
  morphoSupplyCollateral: async ({ avatarAddress, params }) => {
    const approveCall = erc4626Interface.encodeFunctionData('approve', [
      MORPHO,
      params[1], // assets
    ]) as HexAddress
    const supplyCollateralCall = morphoInterface.encodeFunctionData(
      'supplyCollateral',
      [
        [
          params[0][0], // loanToken
          params[0][1], // collateralToken
          params[0][2], // oracle
          params[0][3], // irm
          params[0][4], // ltv
        ], // marketParams (tuple)
        params[1], // assets
        avatarAddress, // onBehalf
        '0x', // data (empty bytes)
      ],
    ) as HexAddress
    return [
      {
        to: params[0][1], // collateralToken
        data: approveCall,
        value: 0n,
      },
      {
        to: MORPHO,
        data: supplyCollateralCall,
        value: 0n,
      },
    ]
  },
  reallocateTo: async ({ params }) => {
    const withdrawals = params[3].map((w: Result) => {
      return [
        [
          w[0][0], // loanToken
          w[0][1], // collateralToken
          w[0][2], // oracle
          w[0][3], // irm
          w[0][4], // ltv
        ], // marketParams
        w[1], // amount
      ]
    })
    const reallocateToCall = publicAllocatorInterface.encodeFunctionData(
      'reallocateTo',
      [
        params[1], // vault
        withdrawals,
        [
          params[4][0], // loanToken
          params[4][1], // collateralToken
          params[4][2], // oracle
          params[4][3], // irm
          params[4][4], // ltv
        ], // supplyMarketParams
      ],
    ) as HexAddress
    return [
      {
        to: params[0], // publicAllocator
        data: reallocateToCall,
        value: 0n,
      },
    ]
  },
  morphoBorrow: async ({ params, avatarAddress }) => {
    const borrowCall = morphoInterface.encodeFunctionData('borrow', [
      [
        params[0][0], // loanToken
        params[0][1], // collateralToken
        params[0][2], // oracle
        params[0][3], // irm
        params[0][4], // ltv
      ], // marketParams
      params[1], // assets
      params[2], // shares
      avatarAddress, // onBehalf
      avatarAddress, // receiver
    ]) as HexAddress
    return [
      {
        to: MORPHO,
        data: borrowCall,
        value: 0n,
      },
    ]
  },
  morphoRepay: async ({ params, avatarAddress, chainId }) => {
    const provider = getReadOnlyProvider(chainId)
    const marketParams = new MarketParams({
      loanToken: params[0][0], // loanToken
      collateralToken: params[0][1], // collateralToken
      oracle: params[0][2], // oracle
      irm: params[0][3], // irm
      lltv: params[0][4], // ltv
    })
    const market = await fetchMarketFromConfig(marketParams, { provider })
    const amount =
      params[1] === 0n
        ? addOnePercent(market.toSupplyAssets(params[2], 'Up'))
        : params[1]
    const approveCall = erc4626Interface.encodeFunctionData('approve', [
      MORPHO,
      amount, // assets
    ]) as HexAddress
    const repayCall = morphoInterface.encodeFunctionData('repay', [
      [
        params[0][0], // loanToken
        params[0][1], // collateralToken
        params[0][2], // oracle
        params[0][3], // irm
        params[0][4], // ltv
      ], // marketParams
      params[1], // assets
      params[2], // shares
      avatarAddress, // onBehalf
      '0x', // data (empty bytes)
    ]) as HexAddress
    return [
      {
        to: params[0][0], // loanToken
        data: approveCall,
        value: 0n,
      },
      {
        to: MORPHO,
        data: repayCall,
        value: 0n,
      },
    ]
  },
}
