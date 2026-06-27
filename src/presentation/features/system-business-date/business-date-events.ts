const BUSINESS_DATE_CHANGED_EVENT = 'prestanet:business-date-changed'

export const notifyBusinessDateChanged = () => {
  window.dispatchEvent(new Event(BUSINESS_DATE_CHANGED_EVENT))
}

export const subscribeToBusinessDateChanges = (listener: () => void) => {
  window.addEventListener(BUSINESS_DATE_CHANGED_EVENT, listener)
  return () => window.removeEventListener(BUSINESS_DATE_CHANGED_EVENT, listener)
}
