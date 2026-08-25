# Complete API Reference (Requested Format)

Base URL: https://ctbackend.realdaddygame.com

## 1. Auth APIs

URL: POST /api/auth/register
Input:
- Headers: Content-Type: application/json
- Body: { name, number, password, referralCode? }
Output:
- JSON (success): user created, OTP sent, basic user details
- JSON (error): validation or registration failure

URL: POST /api/auth/verifyOtp
Input:
- Headers: Content-Type: application/json
- Body: { number, otp }
Output:
- JSON (success): OTP verified, token returned, user details, active announcements
- JSON (error): invalid/expired OTP or user not found

URL: POST /api/auth/resend-otp
Input:
- Headers: Content-Type: application/json
- Body: { number }
Output:
- JSON (success): OTP resent confirmation
- JSON (error): user not found / already verified / inactive account

URL: POST /api/auth/login
Input:
- Headers: Content-Type: application/json
- Body: { number, password }
Output:
- JSON (success): token, user details, active announcements
- JSON (error):
  - requiresVerification response (403) when number not verified (OTP resent)
  - invalid credentials / inactive account

URL: POST /api/auth/forget-password
Input:
- Headers: Content-Type: application/json
- Body: { number }
Output:
- JSON (success): OTP sent confirmation
- JSON (error): missing number / user not found

URL: POST /api/auth/update-password
Input:
- Headers: Content-Type: application/json
- Body: { number, otp, newPassword }
Output:
- JSON (success): password updated
- JSON (error): invalid OTP / user not found / validation error

## 2. User APIs

URL: GET /api/users/profile
Input:
- Headers: Authorization: Bearer <token>
- Params: none
Output:
- JSON (success): profile details (admin receives extra permissions field)
- JSON (error): unauthorized / user not found

URL: GET /api/users/history
Input:
- Headers: Authorization: Bearer <token>
- Params: none
Output:
- JSON (success): logged-in user bet history
- JSON (error): unauthorized / fetch failure

## 3. Wallet & Payment APIs

URL: GET /api/wallet/balance
Input:
- Headers: Authorization: Bearer <token>
- Params: none
Output:
- JSON (success): wallet balance
- JSON (error): unauthorized / wallet error

URL: GET /api/wallet/transactions
Input:
- Headers: Authorization: Bearer <token>
- Query Params: page?, limit?, type?, status?
Output:
- JSON (success): wallet transaction list with pagination
- JSON (error): unauthorized / fetch failure

URL: POST /api/wallet/deposit/initiate
Input:
- Headers: Authorization: Bearer <token>, Content-Type: application/json
- Body: { amount }
Output:
- JSON (success): deposit order created / gateway redirection details
- JSON (error): unauthorized / invalid amount / gateway initiation error

URL: POST /api/wallet/deposit/callback
Input:
- Headers: Content-Type: application/json (gateway callback)
- Body: gateway callback payload
Output:
- JSON/text acknowledgement of callback processing
- JSON (error): signature/processing failure

URL: GET /api/wallet/deposit/status/:orderId
Input:
- Headers: Authorization: Bearer <token>
- Path Params: orderId
Output:
- JSON (success): deposit status for given order
- JSON (error): unauthorized / order not found

URL: POST /api/wallet/withdraw/initiate
Input:
- Headers: Authorization: Bearer <token>, Content-Type: application/json
- Body: { amount, account/bank details as required by controller }
Output:
- JSON (success): withdrawal initiated
- JSON (error): unauthorized / invalid request / insufficient balance / gateway failure

URL: POST /api/wallet/withdraw/callback
Input:
- Headers: Content-Type: application/json (gateway callback)
- Body: gateway callback payload
Output:
- JSON/text acknowledgement of callback processing
- JSON (error): signature/processing failure

URL: GET /api/wallet/withdraw/status/:orderId
Input:
- Headers: Authorization: Bearer <token>
- Path Params: orderId
Output:
- JSON (success): withdrawal status for given order
- JSON (error): unauthorized / order not found

## 4. Game APIs

URL: GET /api/game/current
Input:
- Headers: Authorization: Bearer <token>
- Params: none
Output:
- JSON (success): current 1m/3m/5m games, last game results, wallet balance
- JSON (error): unauthorized / fetch failure

URL: POST /api/game/bet
Input:
- Headers: Authorization: Bearer <token>, Content-Type: application/json
- Body: { period, betType, betValue, betAmount, gameDuration }
Output:
- JSON (success): bet placed details
- JSON (error): unauthorized / invalid bet / insufficient balance / closed round

URL: GET /api/game/history
Input:
- Headers: Authorization: Bearer <token>
- Query Params: page?, limit?, status?, startDate?, endDate?, winningNumber?, color?, size?, period?, all?
Output:
- JSON (success): game rounds list with filters and pagination
- JSON (error): fetch failure

URL: GET /api/game/user-history
Input:
- Headers: Authorization: Bearer <token>
- Params: none
Output:
- JSON (success): user bet history
- JSON (error): unauthorized / fetch failure

## 5. Admin APIs

URL: POST /api/admin/winner
Input:
- Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
- Body: { period, selectedWinningNumber }
Output:
- JSON (success): winner set and round updated
- JSON (error): unauthorized/forbidden / invalid time window / round not found

URL: GET /api/admin/stats
Input:
- Headers: Authorization: Bearer <admin-token>
- Params: none
Output:
- JSON (success): system stats (total bets, payouts, profit, total games)
- JSON (error): unauthorized/forbidden

URL: GET /api/admin/transactions
Input:
- Headers: Authorization: Bearer <admin-token>
- Query Params: page?, limit?, period?, type?, status?, userSearch?, startDate?, endDate?, minAmount?, maxAmount?, sortBy?, sortOrder?
Output:
- JSON (success): transaction list with filters and pagination
- JSON (error): unauthorized/forbidden / fetch failure

URL: GET /api/admin/bets
Input:
- Headers: Authorization: Bearer <admin-token>
- Query Params: page?, limit?, period?, color?, size?, number?, userSearch?, startDate?, endDate?, sortBy?, sortOrder?
Output:
- JSON (success): bets list with filters and pagination
- JSON (error): unauthorized/forbidden / fetch failure

URL: GET /api/admin/users
Input:
- Headers: Authorization: Bearer <admin-token>
- Query Params: page?, limit?, search?, status?, startDate?, endDate?, sortBy?, sortOrder?
Output:
- JSON (success): users list with filters and pagination
- JSON (error): unauthorized/forbidden / fetch failure

URL: GET /api/admin/game-stats
Input:
- Headers: Authorization: Bearer <admin-token>
- Params: none
Output:
- JSON (success): per-game current slot stats including amount/count by number/color/size and profit simulation
- JSON (error): unauthorized/forbidden / stats failure

URL: GET /api/admin/commissions
Input:
- Headers: Authorization: Bearer <admin-token>
- Params: none
Output:
- JSON (success): current level commission percentages
- JSON (error): unauthorized/forbidden

URL: PUT /api/admin/commissions
Input:
- Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
- Body: { level1CommissionPercent?, level2CommissionPercent?, level3CommissionPercent? }
Output:
- JSON (success): updated commission settings
- JSON (error): unauthorized/forbidden / validation failure

## 6. Admin Announcement APIs (under /api/admin)

URL: POST /api/admin/announcements
Input:
- Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
- Body: { title, description, state?, scheduledAt?, isActive? }
Output:
- JSON (success): announcement created
- JSON (error): unauthorized/forbidden / validation failure

URL: GET /api/admin/announcements
Input:` 
- Headers: Authorization: Bearer <admin-token>
- Query Params: page?, limit?, isActive?, state?, q?
Output:
- JSON (success): paginated announcement list
- JSON (error): unauthorized/forbidden

URL: GET /api/admin/announcements/:id
Input:
- Headers: Authorization: Bearer <admin-token>
- Path Params: id
Output:
- JSON (success): announcement detail
- JSON (error): unauthorized/forbidden / not found

URL: PUT /api/admin/announcements/:id
Input:
- Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
- Path Params: id
- Body: { title?, description?, state?, scheduledAt?, isActive? }
Output:
- JSON (success): updated announcement
- JSON (error): unauthorized/forbidden / validation failure / not found

URL: DELETE /api/admin/announcements/:id
Input:
- Headers: Authorization: Bearer <admin-token>
- Path Params: id
Output:
- JSON (success): deleted announcement
- JSON (error): unauthorized/forbidden / not found

URL: PATCH /api/admin/announcements/:id/activate
Input:
- Headers: Authorization: Bearer <admin-token>
- Path Params: id
Output:
- JSON (success): announcement set active
- JSON (error): unauthorized/forbidden / not found

URL: PATCH /api/admin/announcements/:id/deactivate
Input:
- Headers: Authorization: Bearer <admin-token>
- Path Params: id
Output:
- JSON (success): announcement set inactive
- JSON (error): unauthorized/forbidden / not found

## 7. Affiliate APIs

URL: GET /api/affiliate/my-referrals
Input:
- Headers: Authorization: Bearer <token>
- Params: none
Output:
- JSON (success): referral tree/details and earnings
- JSON (error): unauthorized / not found

URL: GET /api/affiliate/settings
Input:
- Headers: none
- Params: none
Output:
- JSON (success): current affiliate commissions and signup bonuses
- JSON (error): fetch failure

URL: PUT /api/affiliate/settings
Input:
- Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
- Body: { level1CommissionPercent?, level2CommissionPercent?, level3CommissionPercent?, level1SignupBonus?, level2SignupBonus?, level3SignupBonus? }
Output:
- JSON (success): updated affiliate settings
- JSON (error): unauthorized/forbidden / validation failure

URL: GET /api/affiliate/statistics
Input:
- Headers: Authorization: Bearer <admin-token>
- Params: none
Output:
- JSON (success): affiliate system statistics
- JSON (error): unauthorized/forbidden / fetch failure

## 8. Query APIs

URL: POST /api/queries/submit
Input:
- Headers: Content-Type: application/json
- Body: { name, email/number, subject, message, ...fields accepted by controller }
Output:
- JSON (success): query submitted
- JSON (error): validation failure

URL: GET /api/queries/all
Input:
- Headers: Authorization: Bearer <admin-token>
- Query Params: page?, limit?, status?
Output:
- JSON (success): all queries list
- JSON (error): unauthorized/forbidden

URL: PATCH /api/queries/status/:id
Input:
- Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
- Path Params: id
- Body: { status }
Output:
- JSON (success): query status updated
- JSON (error): unauthorized/forbidden / not found / invalid status

## 9. Announcement APIs (public/admin mix under /api/announcements)

URL: GET /api/announcements/active
Input:
- Headers: none
- Params: none
Output:
- JSON (success): active announcements list (multiple can be active)
- JSON (error): fetch failure

URL: POST /api/announcements
Input:
- Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
- Body: { title, description, state?, scheduledAt?, isActive? }
Output:
- JSON (success): announcement created
- JSON (error): unauthorized/forbidden / validation failure

URL: GET /api/announcements
Input:
- Headers: Authorization: Bearer <admin-token>
- Query Params: page?, limit?, isActive?, state?, q?
Output:
- JSON (success): paginated announcement list
- JSON (error): unauthorized/forbidden

URL: GET /api/announcements/:id
Input:
- Headers: Authorization: Bearer <admin-token>
- Path Params: id
Output:
- JSON (success): announcement detail
- JSON (error): unauthorized/forbidden / not found

URL: PUT /api/announcements/:id
Input:
- Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
- Path Params: id
- Body: { title?, description?, state?, scheduledAt?, isActive? }
Output:
- JSON (success): updated announcement
- JSON (error): unauthorized/forbidden / validation failure / not found

URL: DELETE /api/announcements/:id
Input:
- Headers: Authorization: Bearer <admin-token>
- Path Params: id
Output:
- JSON (success): deleted announcement
- JSON (error): unauthorized/forbidden / not found

URL: PATCH /api/announcements/:id/activate
Input:
- Headers: Authorization: Bearer <admin-token>
- Path Params: id
Output:
- JSON (success): announcement set active
- JSON (error): unauthorized/forbidden / not found

URL: PATCH /api/announcements/:id/deactivate
Input:
- Headers: Authorization: Bearer <admin-token>
- Path Params: id
Output:
- JSON (success): announcement set inactive
- JSON (error): unauthorized/forbidden / not found

## 10. Health API

URL: GET /health
Input:
- Headers: none
- Params: none
Output:
- JSON (success): { status: "OK", message: "Server is running!" }
