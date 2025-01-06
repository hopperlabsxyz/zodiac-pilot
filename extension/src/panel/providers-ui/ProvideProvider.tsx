import { getChainId } from '@/chains'
import { useExecutionRoute } from '@/execution-routes'
import { ForkProvider } from '@/providers'
import type { Eip1193Provider } from '@/types'
import { invariant } from '@epic-web/invariant'
import { AbiCoder, BrowserProvider, id, TransactionReceipt } from 'ethers'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  ConnectionType,
  parsePrefixedAddress,
  type MetaTransactionRequest,
} from 'ser-kit'
import { ExecutionStatus, useDispatch } from '../state'
import { fetchContractInfo } from '../utils/abi'
import { ProvideSubmitTransactionContext } from './SubmitTransactionContext'

const ProviderContext = createContext<
  (Eip1193Provider & { getTransactionLink(txHash: string): string }) | null
>(null)

export const ProvideProvider = ({ children }: PropsWithChildren) => {
  const route = useExecutionRoute()
  const chainId = getChainId(route.avatar)

  const dispatch = useDispatch()

  const avatarAddress = parsePrefixedAddress(route.avatar)
  const avatarWaypoint = route.waypoints?.[route.waypoints.length - 1]
  const connectionType =
    avatarWaypoint &&
    'connection' in avatarWaypoint &&
    avatarWaypoint.connection.type
  const connectedFrom =
    avatarWaypoint && 'connection' in avatarWaypoint
      ? parsePrefixedAddress(avatarWaypoint.connection.from)
      : undefined

  const moduleAddress =
    connectionType === ConnectionType.IS_ENABLED ? connectedFrom : undefined
  const ownerAddress =
    connectionType === ConnectionType.OWNS ? connectedFrom : undefined

  const onBeforeTransactionSend = useCallback(
    async (id: string, transaction: MetaTransactionRequest) => {
      // Immediately update the state with the transaction so that the UI can show it as pending.
      dispatch({
        type: 'APPEND_TRANSACTION',
        payload: { transaction, id },
      })

      // Now we can take some time decoding the transaction and we update the state once that's done.
      const contractInfo = await fetchContractInfo(
        transaction.to as `0x${string}`,
        chainId,
      )
      dispatch({
        type: 'DECODE_TRANSACTION',
        payload: {
          id,
          contractInfo,
        },
      })
    },
    [chainId, dispatch],
  )

  const onTransactionSent = useCallback(
    async (
      id: string,
      snapshotId: string,
      transactionHash: string,
      provider: Eip1193Provider,
    ) => {
      dispatch({
        type: 'CONFIRM_TRANSACTION',
        payload: {
          id,
          snapshotId,
          transactionHash,
        },
      })

      const receipt = await new BrowserProvider(provider).getTransactionReceipt(
        transactionHash,
      )
      if (!receipt?.status) {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.FAILED,
          },
        })
        return
      }

      if (
        isExecutionFailure(
          receipt.logs[receipt.logs.length - 1],
          avatarAddress,
          moduleAddress,
        )
      ) {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.META_TRANSACTION_REVERTED,
          },
        })
      } else {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.SUCCESS,
          },
        })
      }
    },
    [dispatch, avatarAddress, moduleAddress],
  )

  const onTransactionError = useCallback(
    (id: string, error: unknown) => {
      dispatch({
        type: 'UPDATE_TRANSACTION_STATUS',
        payload: {
          id,
          status: ExecutionStatus.FAILED,
        },
      })

      console.debug(`Transaction ${id} failed`, { error })
    },
    [dispatch],
  )

  const [forkProvider, setForkProvider] = useState<ForkProvider | null>(null)

  // whenever anything changes in the connection settings, we delete the current fork and start afresh
  useEffect(() => {
    const forkProvider = new ForkProvider({
      chainId,
      avatarAddress,
      moduleAddress,
      ownerAddress,
      onBeforeTransactionSend,
      onTransactionSent,
      onTransactionError,
    })

    setForkProvider(forkProvider)

    return () => {
      forkProvider.deleteFork()
    }
  }, [
    chainId,
    avatarAddress,
    moduleAddress,
    ownerAddress,
    onBeforeTransactionSend,
    onTransactionSent,
    onTransactionError,
  ])

  if (forkProvider == null) {
    return null
  }

  return (
    <ProviderContext.Provider value={forkProvider}>
      <ProvideSubmitTransactionContext>
        {children}
      </ProvideSubmitTransactionContext>
    </ProviderContext.Provider>
  )
}

export const useProvider = () => {
  const provider = useContext(ProviderContext)

  invariant(
    provider != null,
    'useProvider() must be used within a <ProvideProvider/>',
  )

  return provider
}

const isExecutionFailure = (
  log: TransactionReceipt['logs'][0],
  avatarAddress: string,
  moduleAddress?: string,
) => {
  if (log.address.toLowerCase() !== avatarAddress.toLowerCase()) {
    return false
  }

  if (moduleAddress) {
    return (
      log.topics[0] === id('ExecutionFromModuleFailure(address)') &&
      log.topics[1] ===
        AbiCoder.defaultAbiCoder().encode(['address'], [moduleAddress])
    )
  }

  return log.topics[0] === id('ExecutionFailure(bytes32, uint256)')
}
