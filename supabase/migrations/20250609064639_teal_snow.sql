-- Communications & Credits Module Migration
-- Adds credit wallet, transactions, and rate management

-- Wallet balance lives on one row per workspace
create table credit_wallets (
  workspace_id uuid primary key references workspaces on delete cascade,
  balance_cents bigint default 0,          -- 1¢ precision
  auto_recharge boolean default false,
  recharge_threshold_cents int default 500,   -- $5
  recharge_amount_cents     int default 2000  -- $20
);

-- Ledger of every movement (top-up, usage, refund)
create table credit_transactions (
  id bigserial primary key,
  workspace_id uuid references workspaces on delete cascade,
  type text check (type in ('TOPUP','USAGE','REFUND')),
  amount_cents bigint,
  twilio_sid text,               -- optional usage ID
  created_at timestamptz default now()
);

-- Live copy of the rate sheet (auto-updated nightly)
create table comm_rates (
  code text primary key,        -- e.g. 'SMS_US_OUT'
  cost_cents    int,            -- Twilio base (≈0.83¢)
  buffer_pct    int,            -- 15
  margin_pct    int             -- 20
);

-- Enable RLS
alter table credit_wallets       enable row level security;
alter table credit_transactions  enable row level security;
alter table comm_rates           enable row level security;

-- RLS Policies
create policy "member read" on credit_wallets
  for select using (is_member_of_workspace(workspace_id));

create policy "owner update" on credit_wallets
  for update using (
    is_member_of_workspace(workspace_id, ARRAY['owner', 'admin'])
  );

create policy "ledger read" on credit_transactions
  for select using (is_member_of_workspace(workspace_id));

create policy "rates read" on comm_rates
  for select using (true);

create policy "rates admin" on comm_rates
  for all using (is_superadmin());

-- Create indexes for performance
create index idx_credit_transactions_workspace on credit_transactions(workspace_id);
create index idx_credit_transactions_type on credit_transactions(type);
create index idx_credit_transactions_created_at on credit_transactions(created_at);

-- Insert feature flag for communications pricing
insert into feature_flags (name, description, enabled, rollout_percentage, target_roles)
values ('COMM_PRICING', 'Communications pricing and credit management', true, 100, ARRAY['artist', 'manager', 'label_admin'])
on conflict (name) do update set
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  target_roles = EXCLUDED.target_roles,
  updated_at = now();

-- Insert initial rate data
insert into comm_rates (code, cost_cents, buffer_pct, margin_pct) values
  ('SMS_US_OUT', 83, 15, 20),
  ('SMS_US_IN', 75, 15, 20),
  ('VOICE_US_OUT', 130, 15, 20),
  ('VOICE_US_IN', 120, 15, 20),
  ('MMS_US_OUT', 150, 15, 20),
  ('MMS_US_IN', 140, 15, 20),
  ('SMS_INTL_OUT', 350, 15, 20),
  ('VOICE_INTL_OUT', 450, 15, 20),
  ('PHONE_NUMBER', 100, 15, 20)
on conflict (code) do update set
  cost_cents = EXCLUDED.cost_cents,
  buffer_pct = EXCLUDED.buffer_pct,
  margin_pct = EXCLUDED.margin_pct;

-- Create function to calculate artist price
create or replace function calculate_artist_price(
  base_cost_cents int,
  buffer_pct int,
  margin_pct int
) returns int as $$
begin
  -- Formula: base_cost * (1 + buffer_pct/100) * (1 + margin_pct/100)
  return round(base_cost_cents * (1 + buffer_pct::float/100) * (1 + margin_pct::float/100));
end;
$$ language plpgsql immutable;

-- Create function to get credit wallet for current workspace
create or replace function get_credit_wallet(workspace_id_param uuid)
returns table (
  balance_cents bigint,
  auto_recharge boolean,
  recharge_threshold_cents int,
  recharge_amount_cents int
) as $$
begin
  -- Create wallet if it doesn't exist
  insert into credit_wallets (workspace_id)
  values (workspace_id_param)
  on conflict (workspace_id) do nothing;
  
  -- Return wallet data
  return query
  select 
    w.balance_cents,
    w.auto_recharge,
    w.recharge_threshold_cents,
    w.recharge_amount_cents
  from credit_wallets w
  where w.workspace_id = workspace_id_param;
end;
$$ language plpgsql security definer;

-- Create function to add credits
create or replace function add_credits(
  workspace_id_param uuid,
  amount_cents_param bigint,
  payment_id_param text
) returns void as $$
begin
  -- Insert transaction
  insert into credit_transactions (
    workspace_id,
    type,
    amount_cents,
    twilio_sid
  ) values (
    workspace_id_param,
    'TOPUP',
    amount_cents_param,
    payment_id_param
  );
  
  -- Update wallet balance
  update credit_wallets
  set balance_cents = balance_cents + amount_cents_param
  where workspace_id = workspace_id_param;
end;
$$ language plpgsql security definer;

-- Create function to deduct credits
create or replace function deduct_credits(
  workspace_id_param uuid,
  amount_cents_param bigint,
  usage_id_param text
) returns boolean as $$
declare
  current_balance bigint;
begin
  -- Get current balance
  select balance_cents into current_balance
  from credit_wallets
  where workspace_id = workspace_id_param;
  
  -- Check if sufficient balance
  if current_balance < amount_cents_param then
    return false;
  end if;
  
  -- Insert transaction
  insert into credit_transactions (
    workspace_id,
    type,
    amount_cents,
    twilio_sid
  ) values (
    workspace_id_param,
    'USAGE',
    -amount_cents_param,
    usage_id_param
  );
  
  -- Update wallet balance
  update credit_wallets
  set balance_cents = balance_cents - amount_cents_param
  where workspace_id = workspace_id_param;
  
  return true;
end;
$$ language plpgsql security definer;

-- Create function to check if auto-recharge is needed
create or replace function check_auto_recharge(workspace_id_param uuid)
returns boolean as $$
declare
  wallet record;
begin
  -- Get wallet data
  select * into wallet
  from credit_wallets
  where workspace_id = workspace_id_param;
  
  -- Check if auto-recharge is enabled and balance is below threshold
  if wallet.auto_recharge and wallet.balance_cents < wallet.recharge_threshold_cents then
    return true;
  end if;
  
  return false;
end;
$$ language plpgsql security definer;