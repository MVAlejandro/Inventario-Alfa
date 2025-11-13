import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

// Conexión a Supabase
const supabaseUrl = "https://rjsnzhrzppvobcmrnzqa.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc256aHJ6cHB2b2JjbXJuenFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTQ3NDIsImV4cCI6MjA3NDkzMDc0Mn0.zY7Pz-KC0oTjnX6dsOmX9zwE7LVho81FQYL46GqG-uc"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase