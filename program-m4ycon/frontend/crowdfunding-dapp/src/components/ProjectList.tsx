'use client'

import {
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { Project } from '../lib/types'
import { compactAddress, formatDatetime, toSOL } from '../lib/formatters'
import CheckIcon from '@mui/icons-material/Check'
import PendingIcon from '@mui/icons-material/Pending'
import {
  History as HistoryIcon,
  Paid as PaidIcon,
  VolunteerActivism as VolunteerActivismIcon,
} from '@mui/icons-material'
import { ContributeModal } from './ContributeModal'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ClaimModal } from './ClaimModal'
import { ContributionsHistoryModal } from './ContributionsHistoryModal'

export interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const { publicKey: userPK } = useWallet()

  const [openContributeModal, setOpenContributeModal] = useState(false)
  const [openClaimModal, setOpenClaimModal] = useState(false)
  const [openHistoryModal, setOpenHistoryModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const isClosed = (project: Project) => {
    return project.closedAt !== null
  }

  const canClaim = (project: Project) => {
    if (!userPK) return false
    if (isClosed(project)) return false

    const isOwner = project.owner.toBase58() === userPK.toBase58()
    const isExpired = dayjs().isAfter(project.goalExpiresAt)
    const goalMet =
      project.amountCollected.toNumber() >= project.amountGoal.toNumber()

    return isOwner && (isExpired || goalMet)
  }

  const onContributeClick = (project: Project) => {
    setSelectedProject(project)
    setOpenContributeModal(true)
  }

  const onClaimClick = (project: Project) => {
    setSelectedProject(project)
    setOpenClaimModal(true)
  }

  const onHistoryClick = (project: Project) => {
    setSelectedProject(project)
    setOpenHistoryModal(true)
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Projects
      </Typography>

      {projects.length === 0 ? (
        <Typography>No projects found.</Typography>
      ) : (
        <div className="flex flex-wrap gap-4">
          {projects.map(project => (
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              className="w-full max-w-72"
              key={project.title + project.owner.toBase58()}
            >
              <CardContent sx={{ flexGrow: 1 }} className="relative">
                <Typography variant="h6" component="div" gutterBottom>
                  {project.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {project.description.length > 100
                    ? `${project.description.slice(0, 100)}...`
                    : project.description}
                </Typography>

                <Typography variant="body2">
                  <strong>Goal:</strong> {toSOL(project.amountGoal)} SOL
                </Typography>

                <Typography variant="body2">
                  <strong>Collected:</strong> {toSOL(project.amountCollected)}{' '}
                  SOL
                </Typography>

                <Typography variant="body2">
                  <strong>Expires:</strong>{' '}
                  {formatDatetime(project.goalExpiresAt)}
                </Typography>

                {project.closedAt && (
                  <Typography variant="body2">
                    <strong>Closed:</strong> {formatDatetime(project.closedAt)}
                  </Typography>
                )}

                <Typography variant="body2">
                  <strong>Created:</strong> {formatDatetime(project.createdAt)}
                </Typography>

                <Typography variant="body2">
                  <strong>Status:</strong>{' '}
                  <span>
                    {project.closedAt ? 'Closed' : 'Active'}
                    {project.closedAt ? (
                      <CheckIcon color="success" />
                    ) : (
                      <PendingIcon color="warning" />
                    )}
                  </span>
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  title={project.owner.toBase58()}
                >
                  <strong>Owner:</strong>{' '}
                  {compactAddress(project.owner.toBase58())}
                </Typography>

                <div className="absolute top-0 right-0 flex">
                  {canClaim(project) && (
                    <Tooltip title="Claim">
                      <IconButton
                        color="success"
                        onClick={() => onClaimClick(project)}
                      >
                        <PaidIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {!isClosed(project) && (
                    <Tooltip title="Contribute">
                      <IconButton
                        color="success"
                        onClick={() => onContributeClick(project)}
                      >
                        <VolunteerActivismIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="History">
                    <IconButton
                      color="warning"
                      onClick={() => onHistoryClick(project)}
                    >
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ))}

          {selectedProject && (
            <ContributeModal
              project={selectedProject}
              open={openContributeModal}
              onClose={() => setOpenContributeModal(false)}
            />
          )}

          {selectedProject && (
            <ClaimModal
              project={selectedProject}
              open={openClaimModal}
              onClose={() => setOpenClaimModal(false)}
            />
          )}

          {selectedProject && (
            <ContributionsHistoryModal
              project={selectedProject}
              open={openHistoryModal}
              onClose={() => setOpenHistoryModal(false)}
            />
          )}
        </div>
      )}
    </Box>
  )
}
