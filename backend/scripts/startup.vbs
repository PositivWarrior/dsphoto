Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & CreateObject("WScript.Shell").CurrentDirectory & "\windows-startup.bat" & Chr(34), 0
Set WshShell = Nothing 