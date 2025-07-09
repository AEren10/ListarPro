-- Create a new bucket for profile photos
insert into storage.buckets (id, name, public) 
values ('profile_photos', 'profile_photos', true);

-- Allow public access to view profile photos
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'profile_photos' );

-- Allow authenticated users to upload their own profile photo
create policy "Users can upload their own profile photo"
on storage.objects for insert
with check ( 
  bucket_id = 'profile_photos' 
  and auth.uid() = (storage.foldername(name)::uuid)
);

-- Allow users to update their own profile photo
create policy "Users can update their own profile photo"
on storage.objects for update
using (
  bucket_id = 'profile_photos'
  and auth.uid() = (storage.foldername(name)::uuid)
); 