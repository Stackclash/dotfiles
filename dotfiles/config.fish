if status is-interactive
    # Commands to run in interactive sessions can go here
end

set fish_greeting

set -x GPG_TTY (tty)
set -x SSH_AUTH_SOCK (gpgconf --list-dirs agent-ssh-socket)
gpgconf --launch gpg-agent

set -gx PATH $PATH $HOME/.krew/bin

starship init fish | source