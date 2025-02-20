import { Page } from '@/components'
import { Outlet } from 'react-router'

const SubmitLayout = () => (
  <Page>
    <Page.Header>Submit</Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default SubmitLayout
