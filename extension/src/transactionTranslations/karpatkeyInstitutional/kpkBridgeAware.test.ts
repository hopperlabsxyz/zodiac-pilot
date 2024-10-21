import { describe, expect, it } from 'vitest'
import kpkBridgeAware from './kpkBridgeAware'
import {
  ETH_GNO_XDAI_BRIDGE,
  ETH_HOP_DAI_BRIDGE,
  ETH_CIRCLE_TOKEN_MESSENGER,
  ARB1_GATEWAY_ROUTER,
  GNOSIS_XDAI_BRIDGE_2,
  OPTIMISM_L2_HOP_CCTP,
  BASE_CIRCLE_TOKEN_MESSENGER,
} from './bridges'

const bridgeAwareContractAddress = '0x36B2a59f3CDa3db1283FEBc7c228E89ecE7Db6f4'

const chainId = 1
const avatarAddress = '0x846e7f810e08f1e2af2c5afd06847cc95f5cae1b'

describe('karpatkey bridge aware translations', () => {
  describe('Mainnet specific bridge translations', () => {
    it('detects bridging of usdc from mainnet using circle_token_bridge', async () => {
      const result = await kpkBridgeAware.translate(
        {
          to: ETH_CIRCLE_TOKEN_MESSENGER.address,
          data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          value: '0x00',
        },
        chainId,
        avatarAddress
      )
      expect(result).toEqual([
        {
          to: ETH_CIRCLE_TOKEN_MESSENGER.address,
          data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          value: '0x00',
        },
        {
          to: bridgeAwareContractAddress,
          data: '0x56aa9cae000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          value: '0x00',
        },
      ])
    })
    it('detects DAI transfers  via ETH_GNO_XDAI_BRIDGE', async () => {
      const result = await kpkBridgeAware.translate(
        {
          to: ETH_GNO_XDAI_BRIDGE.address,
          data: '0x01e4f53a000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000000000000000000000000000000499602d2',
          value: '0x00',
        },
        chainId,
        avatarAddress
      )
      expect(result).toEqual([
        {
          to: ETH_GNO_XDAI_BRIDGE.address,
          data: '0x01e4f53a000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000000000000000000000000000000499602d2',
          value: '0x00',
        },
        {
          to: bridgeAwareContractAddress,
          data: '0x56aa9cae0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
          value: '0x00',
        },
      ])
    })

    it('detects DAI transfers via ETH_HOP_DAI_BRIDGE', async () => {
      const result = await kpkBridgeAware.translate(
        {
          to: ETH_HOP_DAI_BRIDGE.address,
          data: '0xdeace8f50000000000000000000000000000000000000000000000000000000000000001000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000003a0c92075c0dbf3b8acbc5f96ce3f0ad2000000000000000000000000000000000000000c7748819dffb62438d1c67eea00000000000000000000000000000000000000000000000000000000673778790000000000000000000000001234123412341234123412341234123412341235000000000000000000000000000000000000000c7748819dffb62438d1c67eea',
          value: '0x00',
        },
        chainId,
        avatarAddress
      )
      expect(result).toEqual([
        {
          to: ETH_HOP_DAI_BRIDGE.address,
          data: '0xdeace8f50000000000000000000000000000000000000000000000000000000000000001000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000003a0c92075c0dbf3b8acbc5f96ce3f0ad2000000000000000000000000000000000000000c7748819dffb62438d1c67eea00000000000000000000000000000000000000000000000000000000673778790000000000000000000000001234123412341234123412341234123412341235000000000000000000000000000000000000000c7748819dffb62438d1c67eea',
          value: '0x00',
        },
        {
          to: bridgeAwareContractAddress,
          data: '0x56aa9cae0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
          value: '0x00',
        },
      ])
    })
  })

  describe('Arbitrum specific bridge translations', () => {
    it('detects bridging of DAI_eth from arbitrum using ARB1_GATEWAY_ROUTER', async () => {
      const result = await kpkBridgeAware.translate(
        {
          to: ARB1_GATEWAY_ROUTER.address,
          data: '0x7b3a3c8b0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000001234123412341234123412341234123412341234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000',
          value: '0x00',
        },
        chainId,
        avatarAddress
      )
      expect(result).toEqual([
        {
          to: ARB1_GATEWAY_ROUTER.address,
          data: '0x7b3a3c8b0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000001234123412341234123412341234123412341234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000',
          value: '0x00',
        },
        {
          to: bridgeAwareContractAddress,
          data: '0x56aa9cae0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
          value: '0x00',
        },
      ])
    })
  })
  describe('Base specific bridge translations', () => {
    it('detects bridging of USDC from base using BASE_CIRCLE_TOKEN_MESSENGER', async () => {
      const result = await kpkBridgeAware.translate(
        {
          to: BASE_CIRCLE_TOKEN_MESSENGER.address,
          data: '0x6fd3504e0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000012341234123412341234123412341234123412341234123412341234123412340000000000000000000000000b2c639c533813f4aa9d7837caf62653d097ff85',
          value: '0x00',
        },
        chainId,
        avatarAddress
      )
      expect(result).toEqual([
        {
          to: BASE_CIRCLE_TOKEN_MESSENGER.address,
          data: '0x6fd3504e0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000012341234123412341234123412341234123412341234123412341234123412340000000000000000000000000b2c639c533813f4aa9d7837caf62653d097ff85',
          value: '0x00',
        },
        {
          to: bridgeAwareContractAddress,
          data: '0x56aa9cae000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913',
          value: '0x00',
        },
      ])
    })
  })
  describe('Gnosis bridge translations', () => {
    it('detects bridging of XDAI from gnosis using GNOSIS_XDAI_BRIDGE_2', async () => {
      const result = await kpkBridgeAware.translate(
        {
          to: GNOSIS_XDAI_BRIDGE_2.address,
          data: '0x5d1e93070000000000000000000000001234123412341234123412341234123412341234',
          value: '0x00',
        },
        chainId,
        avatarAddress
      )
      expect(result).toEqual([
        {
          to: GNOSIS_XDAI_BRIDGE_2.address,
          data: '0x5d1e93070000000000000000000000001234123412341234123412341234123412341234',
          value: '0x00',
        },
        {
          to: bridgeAwareContractAddress,
          data: '0x56aa9cae000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          value: '0x00',
        },
      ])
    })
  })
  describe('Optimism bridge translations', () => {
    it('detects bridging of USDC from optimism using OPTIMISM_L2_HOP_CCTP', async () => {
      const result = await kpkBridgeAware.translate(
        {
          to: OPTIMISM_L2_HOP_CCTP.address,
          data: '0xa134ce5b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          value: '0x00',
        },
        chainId,
        avatarAddress
      )
      expect(result).toEqual([
        {
          to: OPTIMISM_L2_HOP_CCTP.address,
          data: '0xa134ce5b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          value: '0x00',
        },
        {
          to: bridgeAwareContractAddress,
          data: '0x56aa9cae0000000000000000000000000b2c639c533813f4aa9d7837caf62653d097ff85',
          value: '0x00',
        },
      ])
    })
  })
})
