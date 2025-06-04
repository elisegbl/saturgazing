import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

// Example GET request to fetch data from Supabase
export async function GET() {
  // Example query to fetch all quotes (adjust table name and columns as needed)
  const { data, error } = await supabase
    .from('quotes') // Replace with your table name
    .select('*');

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  // Return the fetched data as JSON
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
