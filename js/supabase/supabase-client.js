
import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

// Conexión a Supabase
const supabaseUrl = "https://bvggwcofdcmerdzqkukm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Z2d3Y29mZGNtZXJkenFrdWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NDA3MDgsImV4cCI6MjA3NDQxNjcwOH0._o56Y4q7cFQuhjAHn60cSFp1z1FNIWaeF_1M2cP-2Dw"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase