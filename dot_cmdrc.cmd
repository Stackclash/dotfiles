@echo off

:::: BITWARDEN SESSION ENVIRONMENT VARIABLE
set BW_SESSION=""

:::: START GPG-AGENT
(gpg-connect-agent killagent /bye) > nul 2>&1
(gpg-connect-agent /bye) > nul 2>&1