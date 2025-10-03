//-------------------------------------------------------------------------------
///
/// TASK: Implement the withdraw functionality for the on-chain vault
///
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
///
///-------------------------------------------------------------------------------

use anchor_lang::{prelude::*};
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::WithdrawEvent;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", vault_authority.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let vault_authority = &mut ctx.accounts.vault_authority;
    require!(!vault.locked, VaultError::VaultLocked);
    require!(
        vault.get_lamports() >= amount,
        VaultError::InsufficientBalance
    );

    vault.sub_lamports(amount)?;
    vault_authority.add_lamports(amount)?;

    // sign?

    emit!(WithdrawEvent {
        amount,
        vault_authority: vault_authority.key(),
        vault: vault.key(),
    });

    Ok(())
}
