# Finding GroupId

A GroupId (or Team ID) is a unique identifier (UID) related to a specific team within Microsoft Teams. 
The reason that this so important is because most of the administrative actions you will use to automate tasks will utilize this value.

To find all GroupIds of your teams, paste commands below (use your own/real e-mail address) in your PowerShell prompt:

```powershell
$Env:myemail="<username>@unb.br"
```

then issue the following command

```powershell
Get-Team -User $Env:myemail | select-object GroupId,DisplayName | ft -wrap
```
