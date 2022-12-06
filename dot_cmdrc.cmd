@echo off

:::: BITWARDEN SESSION ENVIRONMENT VARIABLE
set BW_SESSION=""

:::: START GPG-AGENT
gpg-connect-agent /bye