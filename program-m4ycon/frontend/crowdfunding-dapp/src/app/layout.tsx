'use client'

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import './globals.css'
import { SolanaWalletProvider } from '../components/WalletProvider'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="p-4">
        <ThemeProvider theme={darkTheme}>
          <SolanaWalletProvider>
            <CssBaseline />
            <main>{children}</main>
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
