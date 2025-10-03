'use client'

import { Button } from '@mui/material'
import NextLink from 'next/link'

export interface LinkProps {
  href: string
  children: React.ReactNode
}

export function Link({ href, children }: LinkProps) {
  return (
    <NextLink href={href} passHref>
      <Button variant="contained" color="primary">
        {children}
      </Button>
    </NextLink>
  )
}
