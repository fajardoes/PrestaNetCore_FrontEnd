import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { CollectionChannelDetailPage } from '@/presentation/features/collection-channels/pages/collection-channel-detail-page'
import { CollectionChannelsPage } from '@/presentation/features/collection-channels/pages/collection-channels-page'
import { CollectionChannelTypesPage } from '@/presentation/features/collection-channels/pages/collection-channel-types-page'

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
