import { useForm, FormProvider } from 'react-hook-form'
import { Input } from './Input'
import { Button, CircularProgress } from '@mui/material'
import { ContributeForm, Project } from '../lib/types'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useCrowdfunding } from '../lib/crowdfunding'
import { Modal } from './Modal'

const schema = z.object({
  amount: z.number().gt(0, 'Amount must be greater than 0'),
})

export interface ContributeModalProps {
  project: Project
  open: boolean
  onClose: () => void
}

export function ContributeModal({
  project,
  open,
  onClose,
}: ContributeModalProps) {
  const { contribute } = useCrowdfunding()
  const [loading, setLoading] = useState(false)

  const contributeForm = useForm<ContributeForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: undefined,
    },
  })

  const onSubmit = async (data: ContributeForm) => {
    setLoading(true)
    await contribute({
      projectPK: project.publicKey,
      amount: data.amount,
    })
      .then(contributionPK => {
        contributeForm.reset()
        onClose()
        alert(
          `Contribution submitted successfully! ${contributionPK.toBase58()}`
        )
      })
      .catch(err => {
        console.log(JSON.stringify(err, null, 2))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <FormProvider {...contributeForm}>
        <h1 className="text-2xl">Contribute to &quot;{project.title}&quot;</h1>

        <form onSubmit={contributeForm.handleSubmit(onSubmit)}>
          <fieldset disabled={loading}>
            <div className="flex gap-6">
              <Input
                name="amount"
                label="Amount (SOL)"
                type="number"
                rules={{ valueAsNumber: true }}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </fieldset>
        </form>
      </FormProvider>
    </Modal>
  )
}
