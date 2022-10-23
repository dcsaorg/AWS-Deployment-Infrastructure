Use like 
.\createUsers.ps1 -filename:"test.csv"  -userpool:eu-west-1_WRPoPtIO5  -confirmuser:$true -confirmemail:$false

The parameters is the filename of users list, userpool of the aws environment, a bool that controls whether the user will get status "Confirmed"
and a boolean that controls whether the email attribute is set and is verified (should only be true if email is used as username)

Make a new file in userFiles direcortory to match users.
format is username and the authorization group the user should be member of (only one can be applied)

Output from script is username and generated password

"User myuser@email.com with password = 4IY&>Hc:yc92"
