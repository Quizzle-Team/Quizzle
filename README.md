# Quizzle
The official source code for Quizzle


## Getting started...
cd to the project directory, and run `npm install` just to make sure all dependencies are met, then run `npm run server`, and it should work!
**First thing to do after installation is to go to /signIn and sign in with the `admin` account, it has a default password of `adminUserQUIZ123.`, then click `Change Password` and set it to something different.**

### NOTE:
This is currently still in beta. There could be some bugs, and some potential vulnerabilities, but I am constantly reviewing every endpoint for vulnerabilities like XSS and HPP, and every input is sanitized.

If you find a bug, report it to @shrekman#5545 privately or report it the the #bug-report channel in https://discord.gg/4VDmfuBSFf

It's lacking many features rn, like file upload and account editing*

Build Command: `docker compose build`
Run Containers : `docker compose up`

If you make a change and it isnt registering, try running `docker compose build --no-cache`. This WILL take longer to build(!)

**I forgot to mention, no, adoman is *NOT* a backdoor account, its a test teacher account, its adoman:adoman**
