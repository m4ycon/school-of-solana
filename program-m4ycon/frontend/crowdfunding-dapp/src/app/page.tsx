'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { compactAddress } from '../lib/formatters'
import { Box, Button, CircularProgress, Divider } from '@mui/material'
import { Project } from '../lib/types'
import { WalletButton } from '../components/WalletProvider'
import { useEffect, useState } from 'react'
import { useCrowdfunding } from '../lib/crowdfunding'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { ProjectList } from '../components/ProjectList'

export default function Home() {
  const { publicKey: userPK, connected, disconnect } = useWallet()
  const { initialized, listProjects } = useCrowdfunding()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [openCreateModal, setOpenCreateModal] = useState(false)

  const updateProjects = async () => {
    setLoading(true)
    await listProjects()
      .then(projects => {
        setProjects(projects)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!initialized) return
    updateProjects()
  }, [initialized])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        {!connected ? (
          <WalletButton />
        ) : (
          <div className="flex gap-4 items-center">
            <p>
              Connected wallet:
              <span className="text-cyan-500">
                {compactAddress(userPK?.toBase58() || '')}
              </span>
            </p>

            <Button variant="outlined" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        )}

        <div className="flex">
          <Button variant="contained" onClick={() => setOpenCreateModal(true)}>
            Create project
          </Button>
          <CreateProjectModal
            open={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
            onCreate={() => updateProjects()}
          />
        </div>
      </div>

      <Divider />

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  )
}
