$files = Get-ChildItem -Path "e:\VS-Code\HDFC-Ai-Loan-Predictor\components" -Recurse -Filter "*.jsx"
foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName)
    $orig = $c
    
    # Remove blue glow shadows (shadow-blue-500/*)
    $c = $c -replace ' shadow-blue-500/\d+', ''
    $c = $c -replace ' shadow-lg shadow-blue-\d+/\d+', ' shadow-sm'
    $c = $c -replace ' shadow-xl shadow-blue-\d+/\d+', ' shadow-sm'
    
    # Remove green glow shadows
    $c = $c -replace ' shadow-green-500/\d+', ''
    $c = $c -replace ' shadow-lg shadow-green-\d+/\d+', ' shadow-sm'
    
    # Remove gray glow shadows
    $c = $c -replace ' shadow-gray-200/\d+', ''
    $c = $c -replace ' shadow-lg shadow-gray-\d+/\d+', ' shadow-sm'
    
    # Clean up any other color glow shadows
    $c = $c -replace ' shadow-red-500/\d+', ''
    $c = $c -replace ' shadow-md shadow-blue-\d+/\d+', ' shadow-sm'
    
    # Fix bg-[#f8fafc] -> bg-gray-50
    $c = $c -replace 'bg-\[#f8fafc\]', 'bg-gray-50'
    
    # Normalize partial opacity backgrounds back to solid
    # bg-green-50/50 -> bg-green-50
    $c = $c -replace 'bg-green-50/\d+', 'bg-green-50'
    $c = $c -replace 'bg-red-50/\d+', 'bg-red-50'
    $c = $c -replace 'bg-blue-50/\d+', 'bg-blue-50'
    $c = $c -replace 'bg-gray-50/\d+', 'bg-gray-50'
    $c = $c -replace 'bg-white/\d+', 'bg-white'
    
    # border-green-50 -> border-green-100 (too subtle)
    $c = $c -replace 'border-green-50 ', 'border-green-100 '
    $c = $c -replace 'border-red-50 ', 'border-red-100 '
    $c = $c -replace 'border-blue-50 ', 'border-blue-100 '
    $c = $c -replace 'border-gray-50 ', 'border-gray-100 '
    
    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($f.FullName, $c)
        Write-Output ("Fixed: " + $f.Name)
    }
}
Write-Output "Done!"
