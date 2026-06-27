import { translateRecognitionPolicy } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface RecognitionPolicyBadgesProps {
  interestPolicyCode?: string | null
  feePolicyCode?: string | null
}

export const RecognitionPolicyBadges = ({
  interestPolicyCode,
  feePolicyCode,
}: RecognitionPolicyBadgesProps) => (
  <div className="space-y-3">
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Política de reconocimiento de interés
      </p>
      <div className="mt-2">
        <PolicyBadge value={translateRecognitionPolicy(interestPolicyCode, 'interest')} />
      </div>
    </div>
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Política de reconocimiento de comisión
      </p>
      <div className="mt-2">
        <PolicyBadge value={translateRecognitionPolicy(feePolicyCode, 'fee')} />
      </div>
    </div>
  </div>
)

const PolicyBadge = ({ value }: { value: string }) => (
  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
    {value}
  </span>
)
