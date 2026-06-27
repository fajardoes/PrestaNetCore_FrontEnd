import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const CollectionChannelDetailPage = lazy(() =>
  import('@/presentation/features/collection-channels/pages/collection-channel-detail-page').then(
    (module) => ({
      default: module.CollectionChannelDetailPage,
    }),
  ),
)
const CollectionChannelsPage = lazy(() =>
  import('@/presentation/features/collection-channels/pages/collection-channels-page').then(
    (module) => ({
      default: module.CollectionChannelsPage,
    }),
  ),
)
const CollectionChannelTypesPage = lazy(() =>
  import('@/presentation/features/collection-channels/pages/collection-channel-types-page').then(
    (module) => ({
      default: module.CollectionChannelTypesPage,
    }),
  ),
)

export const CollectionChannelsRoutes = () => (
  <Fragment>
    <Route path="/collection-channels" element={<CollectionChannelsPage />} />
    <Route path="/collection-channels/:id" element={<CollectionChannelDetailPage />} />
    <Route
      path="/collection-channels/channel-types"
      element={<CollectionChannelTypesPage />}
    />
  </Fragment>
)
