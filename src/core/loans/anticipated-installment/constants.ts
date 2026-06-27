export const ANTICIPATED_INSTALLMENT_PERMISSIONS = {
  applicationRead: 'loan_applications.anticipated_installment.read',
  applicationManage: 'loan_applications.anticipated_installment.manage',
  applicationCancel: 'loan_applications.anticipated_installment.cancel',
  loanRead: 'loans.anticipated_installment.read',
  loanApply: 'loans.anticipated_installment.apply',
  loanReverse: 'loans.anticipated_installment.reverse',
  settingsRead: 'loans.anticipated_installment_settings.read',
  settingsManage: 'loans.anticipated_installment_settings.manage',
  transitAccountManage: 'system.settings.anticipated_installment_transit_account.manage',
} as const

export const ANTICIPATED_INSTALLMENT_APPLICATION_ACTIONS = {
  view: 'view_anticipated_installment',
  manage: 'manage_anticipated_installment',
  cancel: 'cancel_anticipated_installment',
} as const

export const ANTICIPATED_INSTALLMENT_LOAN_ACTIONS = {
  view: 'view_anticipated_installment',
  apply: 'apply_anticipated_installment',
  reverse: 'reverse_anticipated_installment_application',
} as const
