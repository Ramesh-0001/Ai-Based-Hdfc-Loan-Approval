$files = Get-ChildItem -Path "e:\VS-Code\HDFC-Ai-Loan-Predictor\components" -Recurse -Filter "*.jsx"
foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName)
    $orig = $c
    
    # slate -> gray (normalize all slate to gray)
    $c = $c -replace 'slate-50', 'gray-50'
    $c = $c -replace 'slate-100', 'gray-100'
    $c = $c -replace 'slate-200', 'gray-200'
    $c = $c -replace 'slate-300', 'gray-300'
    $c = $c -replace 'slate-400', 'gray-400'
    $c = $c -replace 'slate-500', 'gray-500'
    $c = $c -replace 'slate-600', 'gray-600'
    $c = $c -replace 'slate-700', 'gray-700'
    $c = $c -replace 'slate-800', 'gray-800'
    $c = $c -replace 'slate-900', 'gray-900'
    
    # emerald -> green (normalize)
    $c = $c -replace 'emerald-50', 'green-50'
    $c = $c -replace 'emerald-100', 'green-100'
    $c = $c -replace 'emerald-200', 'green-200'
    $c = $c -replace 'emerald-300', 'green-300'
    $c = $c -replace 'emerald-400', 'green-400'
    $c = $c -replace 'emerald-500', 'green-500'
    $c = $c -replace 'emerald-600', 'green-600'
    $c = $c -replace 'emerald-700', 'green-700'
    
    # purple -> blue (reduce color palette)
    $c = $c -replace 'purple-50', 'blue-50'
    $c = $c -replace 'purple-100', 'blue-100'
    $c = $c -replace 'purple-400', 'blue-400'
    $c = $c -replace 'purple-500', 'blue-500'
    $c = $c -replace 'purple-600', 'blue-600'
    $c = $c -replace 'purple-700', 'blue-700'
    
    # indigo -> blue
    $c = $c -replace 'indigo-50', 'blue-50'
    $c = $c -replace 'indigo-100', 'blue-100'
    $c = $c -replace 'indigo-400', 'blue-400'
    $c = $c -replace 'indigo-500', 'blue-500'
    $c = $c -replace 'indigo-600', 'blue-600'
    $c = $c -replace 'indigo-700', 'blue-700'
    $c = $c -replace 'indigo-800', 'blue-800'
    $c = $c -replace 'indigo-900', 'blue-900'
    
    # teal -> green
    $c = $c -replace 'teal-50', 'green-50'
    $c = $c -replace 'teal-100', 'green-100'
    $c = $c -replace 'teal-400', 'green-400'
    $c = $c -replace 'teal-500', 'green-500'
    $c = $c -replace 'teal-600', 'green-600'
    
    # cyan -> blue
    $c = $c -replace 'cyan-50', 'blue-50'
    $c = $c -replace 'cyan-100', 'blue-100'
    $c = $c -replace 'cyan-400', 'blue-400'
    $c = $c -replace 'cyan-500', 'blue-500'
    $c = $c -replace 'cyan-600', 'blue-600'
    
    # violet -> blue
    $c = $c -replace 'violet-50', 'blue-50'
    $c = $c -replace 'violet-100', 'blue-100'
    $c = $c -replace 'violet-400', 'blue-400'
    $c = $c -replace 'violet-500', 'blue-500'
    $c = $c -replace 'violet-600', 'blue-600'
    
    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($f.FullName, $c)
        Write-Output ("Fixed: " + $f.Name)
    }
}
Write-Output "Done!"
