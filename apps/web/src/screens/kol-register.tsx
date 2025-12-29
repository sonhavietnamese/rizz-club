import Step1 from '@/components/step-1'
import Step2 from '@/components/step-2'
import Step3 from '@/components/step-3'
import Step4 from '@/components/step-4'
import { useRegisterStore } from '@/stores/register'

export default function PanelKolRegister() {
  const { step } = useRegisterStore()
  return (
    <>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </>
  )
}
