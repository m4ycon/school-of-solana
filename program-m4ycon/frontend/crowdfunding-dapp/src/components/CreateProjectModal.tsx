import { useForm, FormProvider } from 'react-hook-form'
import { Input } from '../components/Input'
import { Button, CircularProgress } from '@mui/material'
import { CreateProjectForm } from '../lib/types'
import * as anchor from '@coral-xyz/anchor'
import dayjs from 'dayjs'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useCrowdfunding } from '../lib/crowdfunding'
import { Modal } from './Modal'

const schema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(32, 'Title must be 32 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  amountGoal: z.number().positive('Goal must be greater than 0'),
  goalExpiresAt: z
    .string()
    .refine(
      val => dayjs(val).endOf('day').toDate().getTime() > Date.now(),
      'Expiration must be in the future'
    ),
})

export interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreate?: () => void
}

export function CreateProjectModal({
  open,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const { initProject } = useCrowdfunding()
  const [loading, setLoading] = useState(false)

  const createProjectForm = useForm<CreateProjectForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      amountGoal: 0,
      goalExpiresAt: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    },
  })

  const onSubmit = async (data: CreateProjectForm) => {
    setLoading(true)
    await initProject({
      title: data.title,
      description: data.description,
      amountGoal: new anchor.BN(data.amountGoal * anchor.web3.LAMPORTS_PER_SOL),
      goalExpiresAt: new anchor.BN(
        dayjs(data.goalExpiresAt).endOf('day').unix()
      ),
    })
      .then(projectPK => {
        createProjectForm.reset()
        onCreate?.()
        onClose()
        alert(`Project created successfully! ${projectPK.toBase58()}`)
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
      <FormProvider {...createProjectForm}>
        <h1>Create Project</h1>

        <form onSubmit={createProjectForm.handleSubmit(onSubmit)}>
          <fieldset disabled={loading}>
            <div className="flex gap-6">
              <Input name="title" label="Title" />
              <Input name="description" label="Description" />
            </div>

            <div className="flex gap-6">
              <Input
                name="amountGoal"
                label="Amount goal (SOL)"
                type="number"
                rules={{ valueAsNumber: true }}
              />
              <Input name="goalExpiresAt" label="Goal expires at" type="date" />
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
