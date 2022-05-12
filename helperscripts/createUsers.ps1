param (
    [string]$filename = $(throw "-filename is required."),
	[string]$userpool = $(throw "-userpool is required."),
	[switch]$confirmuser,
	[switch]$confirmemail
)
function Get-RandomPassword {
    param (
        [Parameter(Mandatory)]
        [int] $length = 8,
        [int] $amountOfNonAlphanumeric = 1
    )
    Add-Type -AssemblyName 'System.Web'
	do {
		$pwd = [System.Web.Security.Membership]::GeneratePassword($length,$amountOfNonAlphanumeric)
		} until ($pwd -match '\d')
    return $pwd
}

$users = New-Object System.Collections.ArrayList

Import-Csv .\userFiles\$filename | ForEach-Object {
	$password = Get-RandomPassword 12 2
	aws cognito-idp admin-create-user --user-pool-id $userpool --username $($_.username) --message-action SUPPRESS $(If ($confirmemail) {"--user-attributes Name=email,Value='$($_.username)' Name=email_verified,Value=TRUE"} Else {""});
	aws cognito-idp admin-add-user-to-group --user-pool-id $userpool --username $($_.username) --group-name $($_.group)
	aws cognito-idp admin-set-user-password --user-pool-id $userpool --username $($_.username) --password $password $(If ($confirmuser) {'--permanent'} Else {''}) 
	$users.Add("User $($_.username) with password = $password")		
}

foreach ($user in $users) {
		Write-Output $user;	
}
