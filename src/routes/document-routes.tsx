import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const DocumentTemplateListPage = lazy(() =>
  import('@/presentation/features/documents/templates/pages/document-template-list-page').then((module) => ({
    default: module.DocumentTemplateListPage,
  })),
)

const DocumentTemplateEditorPage = lazy(() =>
  import('@/presentation/features/documents/templates/pages/document-template-editor-page').then((module) => ({
    default: module.DocumentTemplateEditorPage,
  })),
)

export const DocumentRoutes = () => (
  <Fragment>
    <Route path="/documents/templates" element={<DocumentTemplateListPage />} />
    <Route path="/documents/templates/:templateId" element={<DocumentTemplateEditorPage />} />
  </Fragment>
)
