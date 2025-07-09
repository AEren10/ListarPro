-- Enable RLS
alter table shops enable row level security;

-- Create policy for authenticated users to insert
create policy "Users can insert shops"
on shops for insert
to authenticated
with check (true);

-- Create policy for authenticated users to select their own shops
create policy "Users can view shops"
on shops for select
to authenticated
using (true);

-- Create policy for authenticated users to update their own shops
create policy "Users can update their own shops"
on shops for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create policy for authenticated users to delete their own shops
create policy "Users can delete their own shops"
on shops for delete
to authenticated
using (auth.uid() = user_id); 