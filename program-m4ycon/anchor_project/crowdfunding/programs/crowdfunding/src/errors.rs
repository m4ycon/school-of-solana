use anchor_lang::prelude::*;

#[error_code]
pub enum CrowdfundingError {
    #[msg("Cannot initialize, title too long")]
    TitleTooLong,
    #[msg("Cannot initialize, description too long")]
    DescriptionTooLong,
    #[msg("Cannot initialize, goal must be greater than zero")]
    GoalMustBeGreaterThanZero,
    #[msg("Cannot initialize, expires at must be greater than now")]
    ExpiresAtMustBeGreaterThanNow,
    #[msg("Cannot contribute, amount must be greater than zero")]
    AmountMustBeGreaterThanZero,
    #[msg("Cannot claim, amount collected did not reach goal or project is not expired yet")]
    TooEarlyToClaim,
    #[msg("Cannot claim, insufficient funds to claim")]
    InsufficientFundsToClaim,
    #[msg("Project is already closed")]
    AlreadyClosed,
}
