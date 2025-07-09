-- Önce varolan politikaları temizleyelim
drop policy if exists "Anyone can view images" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Users can update their own images" on storage.objects;
drop policy if exists "Users can delete their own images" on storage.objects;

-- Storage için yeni RLS politikaları
create policy "Anyone can view images"
on storage.objects for select
to public
using ( true );

create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check ( true );

create policy "Users can update their own images"
on storage.objects for update
to authenticated
using ( owner = auth.uid() );

create policy "Users can delete their own images"
on storage.objects for delete
to authenticated
using ( owner = auth.uid() ); 