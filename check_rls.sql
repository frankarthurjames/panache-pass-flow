-- Vérification des politiques RLS actuelles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'organizations'
ORDER BY policyname;
