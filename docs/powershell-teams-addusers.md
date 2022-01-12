# Finding GroupId

A GroupId (or Team ID) is a unique identifier (UID) related to a specific team within Microsoft Teams. 
The reason that this so important is because most of the administrative actions you will use to automate tasks will utilize this value.

To find all GroupIds of your teams, paste commands below (change to your own/real e-mail address) in your PowerShell prompt:

```powershell
$myemail = "<your_username>@unb.br"
```

then issue the following command

```powershell
Get-Team -User $myemail | select-object GroupId,DisplayName | ft -wrap
```

Take note of the desired GroupId and then save it in a variable/object:

```powershell
$groupid = "c05f72ff-b7e5-42f6-99e3-5f87cfd3ef7c"
```

# Listing users

Store and print all users from a specific Team

```powershell
$users = Get-TeamUser -GroupId $groupid | select user
Write-Output $users
```

# Removing all users (not Owner) from a Team

```powershell
foreach ($user in $users.User) {
  Remove-TeamUser -GroupId $groupid -User $user -Role Member -ErrorAction Ignore
}
Get-TeamUser -GroupId $groupid | select user
```

# Adding users from a CSV file

```powershell
$file = "C:\Temp\emails.csv"
Import-Csv -Path $file | foreach {Add-TeamUser -GroupId $groupid -user $_.emails}
Get-TeamUser -GroupId $groupid | select user
```
