import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROMOTED_FILE_PATH = path.join(process.cwd(), 'src/lib/promoted.json');

const INITIAL_PROMOTIONS = [
  {
    id: 'doc_1',
    name: 'Dr. Ramesh Kumar',
    type: 'doctor',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    speciality: 'Cardiology',
    rating: 4.9,
    experience: 18,
    city: 'Delhi',
    consultationFee: 1500,
    tagline: 'Leading Senior Cardiologist · 18+ Years Expert AIIMS Alumnus',
    promotedAt: new Date().toISOString()
  },
  {
    id: 'hosp_1',
    name: 'Apollo Hospital Indraprastha',
    type: 'hospital',
    image: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e963?auto=format&fit=crop&q=80&w=800',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
    rating: 4.8,
    city: 'Delhi',
    address: 'Mathura Road, Sarita Vihar, New Delhi',
    facilities: ['ICU (100+ Beds)', '24/7 Emergency', 'Robotic Surgery'],
    tagline: 'World-Class Multispeciality Care & Premier Clinical Excellence',
    promotedAt: new Date().toISOString()
  }
];

function getPromotedData() {
  try {
    if (!fs.existsSync(PROMOTED_FILE_PATH)) {
      // Ensure target directory exists
      fs.mkdirSync(path.dirname(PROMOTED_FILE_PATH), { recursive: true });
      fs.writeFileSync(PROMOTED_FILE_PATH, JSON.stringify(INITIAL_PROMOTIONS, null, 2));
      return INITIAL_PROMOTIONS;
    }
    const raw = fs.readFileSync(PROMOTED_FILE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading/initializing promoted data:', error);
    return INITIAL_PROMOTIONS;
  }
}

function savePromotedData(data: any) {
  try {
    fs.mkdirSync(path.dirname(PROMOTED_FILE_PATH), { recursive: true });
    fs.writeFileSync(PROMOTED_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving promoted data:', error);
    return false;
  }
}

// CORS Helper headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  const data = getPromotedData();
  return NextResponse.json(data, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, item, id } = body;

    let current = getPromotedData();

    if (action === 'promote') {
      // Remove existing one if any
      current = current.filter((i: any) => i.id !== item.id);
      current.unshift({
        ...item,
        promotedAt: new Date().toISOString()
      });
    } else if (action === 'cancel') {
      current = current.filter((i: any) => i.id !== id);
    }

    const success = savePromotedData(current);
    if (!success) {
      return NextResponse.json({ error: 'Failed to write data' }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: current }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
