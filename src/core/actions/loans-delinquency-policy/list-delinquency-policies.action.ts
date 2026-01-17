import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { GetDelinquencyPoliciesRequestDto } from '@/infrastructure/intranet/requests/loans/get-delinquency-policies.request'
import type { DelinquencyPolicyListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-list-item.response'
import { DelinquencyPolicyRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy.repository'

export class ListDelinquencyPoliciesAction {
  private repository: DelinquencyPolicyRepository

  constructor(repository: DelinquencyPolicyRepository) {
    this.repository = repository
  }

  async execute(
    query: GetDelinquencyPoliciesRequestDto,
  ): Promise<ApiResult<DelinquencyPolicyListItemDto[]>> {
    try {
      const data = await this.repository.list(query)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible cargar las políticas de mora.')
    }
  }
}

const repository = new DelinquencyPolicyRepository()
const action = new ListDelinquencyPoliciesAction(repository)

export const listDelinquencyPoliciesAction = (
  query: GetDelinquencyPoliciesRequestDto,
) => action.execute(query)
