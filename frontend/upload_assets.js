import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const imagesToUpload = [
  'add_on.png',
  'ice_cream.png',
  'Beckon.png',
  'Frutero.png',
  'Bubbies.png',
  'Nicks.png',
  'Yasso.png',
  'icream.png'
];

async function uploadAssets() {
  console.log('Ensuring website-assets bucket exists...');
  await supabaseAdmin.storage.createBucket('website-assets', { public: true });

  const publicImagesDir = path.join(process.cwd(), 'public', 'images');

  for (const imgName of imagesToUpload) {
    const imgPath = path.join(publicImagesDir, imgName);
    if (fs.existsSync(imgPath)) {
      const fileBuffer = fs.readFileSync(imgPath);
      console.log(`Uploading ${imgName}...`);
      const { error } = await supabaseAdmin.storage.from('website-assets').upload(imgName, fileBuffer, {
        upsert: true,
        contentType: 'image/png'
      });
      if (error) {
        console.error(`Failed to upload ${imgName}:`, error.message);
      } else {
        console.log(`Successfully uploaded ${imgName}.`);
      }
    } else {
      console.log(`File not found locally: ${imgPath}`);
    }
  }
}

uploadAssets();
