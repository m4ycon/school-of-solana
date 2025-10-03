import * as React from 'react'
import Box from '@mui/material/Box'
import MuiModal from '@mui/material/Modal'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
}

export interface ModalProps {
  children?: React.ReactNode[] | React.ReactNode
  open: boolean
  onClose: () => void
}

export function Modal({ children, open, onClose }: ModalProps) {
  return (
    <MuiModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>{children}</Box>
    </MuiModal>
  )
}
