import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import anchor from '@coral-xyz/anchor'
import dayjs from 'dayjs'

export function compactAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function toSOL(amount: anchor.BN) {
  return (amount.toNumber() / LAMPORTS_PER_SOL).toFixed(8)
}

export function formatDatetime(date: Date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
