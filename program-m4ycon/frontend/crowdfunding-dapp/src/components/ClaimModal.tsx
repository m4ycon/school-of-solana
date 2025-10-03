import { Button, CircularProgress } from '@mui/material'
import { Project } from '../lib/types'
import { z } from 'zod'
import { useState } from 'react'
import { useCrowdfunding } from '../lib/crowdfunding'
import { Modal } from './Modal'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { toSOL } from '../lib/formatters'

export interface ClaimModalProps {
  project: Project
  open: boolean
  onClose: () => void
}

export function ClaimModal({ project, open, onClose }: ClaimModalProps) {
  const { claimCollected } = useCrowdfunding()
  const [loading, setLoading] = useState(false)

  const onClaimClick = async (project: Project) => {
    setLoading(true)
    await claimCollected({
      projectPK: project.publicKey,
    })
      .then(() => {
        onClose()
        alert(`Collected successfully!`)
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
      <h1 className="text-2xl">
        Are you sure you want to claim &quot;{project.title}&quot;?
      </h1>

      <br />

      <p>
        <strong>Amount:</strong> {toSOL(project.amountCollected)} SOL
      </p>
      <p>
        <strong>Amount goal:</strong> {toSOL(project.amountGoal)} SOL
      </p>

      <br />

      <div className="flex justify-end gap-4">
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => onClaimClick(project)}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Claiming...' : 'Claim'}
        </Button>
      </div>
    </Modal>
  )
}
