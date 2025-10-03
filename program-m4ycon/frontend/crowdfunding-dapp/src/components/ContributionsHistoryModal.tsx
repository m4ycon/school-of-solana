'use client'

import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import { Contribution, Project } from '../lib/types'
import { useCrowdfunding } from '../lib/crowdfunding'
import { compactAddress, formatDatetime, toSOL } from '../lib/formatters'

export interface ContributionsHistoryModalProps {
  project: Project
  open: boolean
  onClose: () => void
}

export function ContributionsHistoryModal({
  project,
  open,
  onClose,
}: ContributionsHistoryModalProps) {
  const { listContributions } = useCrowdfunding()
  const [loading, setLoading] = useState(false)
  const [contributions, setContributions] = useState<Contribution[]>([])

  useEffect(() => {
    if (!project || !project.publicKey) return

    setLoading(true)
    listContributions(project.publicKey)
      .then(setContributions)
      .finally(() => setLoading(false))
  }, [project])

  return (
    <Modal open={open} onClose={onClose}>
      <Typography variant="h6" gutterBottom>
        Contribution History for &quot;{project.title}&quot;
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : contributions.length === 0 ? (
        <Typography>No contributions found.</Typography>
      ) : (
        <List dense>
          {contributions.map((contribution, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`Contributed ${toSOL(contribution.amount)} SOL`}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Contributor:{' '}
                      {compactAddress(contribution.contributor.toBase58())}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2">
                      Date: {formatDatetime(contribution.createdAt)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Modal>
  )
}
