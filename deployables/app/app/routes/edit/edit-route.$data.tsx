import {
  AvatarInput,
  ChainSelect,
  ConnectWallet,
  useIsDev,
  WalletProvider,
  ZodiacMod,
} from '@/components'
import { useIsPending } from '@/hooks'
import {
  dryRun,
  editRoute,
  jsonRpcProvider,
  parseRouteData,
  routeTitle,
} from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { getChainId, verifyChainId, ZERO_ADDRESS } from '@zodiac/chains'
import {
  formData,
  getHexString,
  getInt,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import { CompanionAppMessageType } from '@zodiac/messages'
import {
  createAccount,
  createEoaAccount,
  getRolesVersion,
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  removeAvatar,
  SupportedZodiacModuleType,
  updateAvatar,
  updateChainId,
  updateLabel,
  updateRoleId,
  updateRolesWaypoint,
  updateStartingPoint,
  zodiacModuleSchema,
  type ZodiacModule,
} from '@zodiac/modules'
import {
  jsonStringify,
  type ExecutionRoute,
  type Waypoints,
} from '@zodiac/schema'
import {
  Error,
  Form,
  PrimaryButton,
  SecondaryButton,
  SecondaryLinkButton,
  Success,
  TextInput,
} from '@zodiac/ui'
import { useEffect, useState } from 'react'
import {
  useLoaderData,
  useNavigation,
  useParams,
  useSubmit,
} from 'react-router'
import { unprefixAddress } from 'ser-kit'
import type { Route } from './+types/edit-route.$data'
import { Intent } from './intents'

export const meta: Route.MetaFunction = ({ data, matches }) => [
  { title: routeTitle(matches, data.label || 'Unnamed route') },
]

export const loader = ({ params }: Route.LoaderArgs) => {
  const route = parseRouteData(params.data)
  const chainId = getChainId(route.avatar)

  return {
    label: route.label,
    initiator: route.initiator,
    chainId,
    avatar: route.avatar,
    waypoints: route.waypoints,
  }
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const route = parseRouteData(params.data)
  const data = await request.formData()

  const intent = getString(data, 'intent')

  invariantResponse(
    intent === Intent.UpdateModule,
    `Invalid intent "${intent}" received in server action`,
  )

  const module = zodiacModuleSchema.parse(JSON.parse(getString(data, 'module')))

  const updatedRoute = updateRolesWaypoint(route, {
    moduleAddress: module.moduleAddress,
    version: getRolesVersion(module.type),
    multisend: await getMultisend(route, module),
  })

  return editRoute(updatedRoute)
}

export const clientAction = async ({
  serverAction,
  request,
  params,
}: Route.ClientActionArgs) => {
  const data = await request.clone().formData()

  const intent = getOptionalString(data, 'intent')

  switch (intent) {
    case Intent.DryRun:
    case Intent.Save: {
      let route = parseRouteData(params.data)

      const roleId = getOptionalString(data, 'roleId')

      if (roleId != null) {
        route = updateRoleId(route, roleId)
      }

      route = updateLabel(route, getString(data, 'label'))

      if (intent === Intent.Save) {
        window.postMessage(
          { type: CompanionAppMessageType.SAVE_ROUTE, data: route },
          '*',
        )

        return editRoute(route)
      }

      const chainId = getChainId(route.avatar)

      return dryRun(jsonRpcProvider(chainId), route)
    }
    case Intent.UpdateChain: {
      const route = parseRouteData(params.data)
      const chainId = verifyChainId(getInt(data, 'chainId'))

      return editRoute(updateChainId(route, chainId))
    }
    case Intent.UpdateAvatar: {
      const route = parseRouteData(params.data)
      const avatar = getHexString(data, 'avatar')

      return editRoute(updateAvatar(route, { safe: avatar }))
    }
    case Intent.RemoveAvatar: {
      const route = parseRouteData(params.data)

      return editRoute(removeAvatar(route))
    }
    case Intent.ConnectWallet: {
      const route = parseRouteData(params.data)

      const address = getHexString(data, 'address')
      const account = await createAccount(
        jsonRpcProvider(getChainId(route.avatar)),
        address,
      )

      return editRoute(updateStartingPoint(route, account))
    }
    case Intent.DisconnectWallet: {
      const route = parseRouteData(params.data)

      return editRoute(
        updateStartingPoint(route, createEoaAccount({ address: ZERO_ADDRESS })),
      )
    }

    default:
      return serverAction()
  }
}

const EditRoute = ({
  loaderData: { chainId, label, avatar, waypoints, initiator },
  actionData,
}: Route.ComponentProps) => {
  const submit = useSubmit()
  const optimisticRoute = useOptimisticRoute()
  const isDev = useIsDev()

  return (
    <>
      <Form>
        <TextInput label="Label" name="label" defaultValue={label} />

        <WalletProvider>
          <ConnectWallet
            chainId={chainId}
            pilotAddress={optimisticRoute.pilotAddress}
            onConnect={({ address }) => {
              submit(
                formData({
                  intent: Intent.ConnectWallet,
                  address,
                }),
                { method: 'POST' },
              )
            }}
            onDisconnect={() => {
              submit(formData({ intent: Intent.DisconnectWallet }), {
                method: 'POST',
              })
            }}
          />
        </WalletProvider>

        <ChainSelect
          value={chainId}
          onChange={(chainId) => {
            submit(formData({ intent: Intent.UpdateChain, chainId }), {
              method: 'POST',
            })
          }}
        />

        <AvatarInput
          value={unprefixAddress(avatar)}
          pilotAddress={initiator ? unprefixAddress(initiator) : null}
          chainId={chainId}
          onChange={(avatar) => {
            if (avatar != null) {
              submit(formData({ intent: Intent.UpdateAvatar, avatar }), {
                method: 'POST',
              })
            } else {
              submit(formData({ intent: Intent.RemoveAvatar }), {
                method: 'POST',
              })
            }
          }}
        />

        <ZodiacMod
          avatar={avatar}
          waypoints={waypoints}
          onSelect={(module) => {
            submit(
              formData({
                intent: Intent.UpdateModule,
                module: jsonStringify(module),
              }),
              {
                method: 'POST',
              },
            )
          }}
        />

        <Form.Actions>
          <div className="text-balance text-xs opacity-75">
            The Pilot extension must be open to save.
          </div>

          <div className="flex gap-2">
            {isDev && <DebugRouteData />}

            <SecondaryButton
              submit
              intent={Intent.DryRun}
              busy={useIsPending(Intent.DryRun)}
            >
              Test route
            </SecondaryButton>

            <PrimaryButton
              submit
              intent={Intent.Save}
              busy={useIsPending(Intent.Save)}
            >
              Save & Close
            </PrimaryButton>
          </div>
        </Form.Actions>

        {actionData != null && (
          <div className="mt-8">
            {actionData.error === true && (
              <Error title="Dry run failed">{actionData.message}</Error>
            )}

            {actionData.error === false && (
              <Success title="Dry run succeeded">
                Your route seems to be ready for execution!
              </Success>
            )}
          </div>
        )}
      </Form>
    </>
  )
}

export default EditRoute

const useOptimisticRoute = () => {
  const { waypoints, chainId } = useLoaderData<typeof loader>()
  const pilotAddress = getPilotAddress(waypoints)

  const { formData } = useNavigation()

  const [optimisticConnection, setOptimisticConnection] = useState({
    pilotAddress,
  })

  useEffect(() => {
    setOptimisticConnection({ pilotAddress })
  }, [chainId, pilotAddress])

  useEffect(() => {
    if (formData == null) {
      return
    }

    const intent = getOptionalString(formData, 'intent')

    if (intent == null) {
      return
    }

    switch (intent) {
      case Intent.DisconnectWallet: {
        setOptimisticConnection({
          pilotAddress: ZERO_ADDRESS,
        })

        break
      }

      case Intent.ConnectWallet: {
        setOptimisticConnection({
          pilotAddress: getHexString(formData, 'address'),
        })
      }
    }
  }, [formData])

  return optimisticConnection
}

const getPilotAddress = (waypoints?: Waypoints) => {
  if (waypoints == null) {
    return null
  }

  const [startingPoint] = waypoints

  return startingPoint.account.address
}

const getMultisend = (route: ExecutionRoute, module: ZodiacModule) => {
  const chainId = getChainId(route.avatar)

  switch (module.type) {
    case SupportedZodiacModuleType.ROLES_V1:
      return queryRolesV1MultiSend(
        jsonRpcProvider(chainId),
        module.moduleAddress,
      )
    case SupportedZodiacModuleType.ROLES_V2:
      return queryRolesV2MultiSend(chainId, module.moduleAddress)
  }

  invariant(false, `Cannot get multisend for module type "${module.type}"`)
}

const DebugRouteData = () => {
  const { data } = useParams()

  return (
    <SecondaryLinkButton openInNewWindow to={`/dev/decode/${data}`}>
      Debug route data
    </SecondaryLinkButton>
  )
}
