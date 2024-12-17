import {
  createTransaction,
  mockRoutes,
  mockTabSwitch,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Transactions } from './Transactions'

describe('Transactions', () => {
  describe('Recording state', () => {
    it('hides the info when Pilot is ready', async () => {
      await render('/test-route', [
        { path: '/:activeRouteId', Component: Transactions },
      ])

      expect(
        screen.getByRole('heading', { name: 'Recording transactions' }),
      ).not.toHaveAccessibleDescription()
    })

    it('shows that transactions cannot be recorded when Pilot is not ready, yet', async () => {
      await render('/test-route', [
        { path: '/:activeRouteId', Component: Transactions },
      ])

      await mockTabSwitch({ url: 'chrome://extensions' })

      expect(
        screen.getByRole('heading', { name: 'Not recording transactions' }),
      ).toHaveAccessibleDescription('Recording starts when Pilot connects')
    })
  })

  describe('List', () => {
    it('lists transactions', async () => {
      await mockRoutes()

      await render('/', [{ path: '/', Component: Transactions }], {
        initialState: [createTransaction()],
      })

      expect(
        screen.getByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })

  describe('Submit', () => {
    it('disables the submit button when the current tab goes into a state where submit is not possible', async () => {
      await render(
        '/test-route',
        [{ path: '/:activeRouteId', Component: Transactions }],
        {
          initialState: [createTransaction()],
        },
      )

      await mockTabSwitch({ url: 'chrome://extensions' })

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    })
  })
})
