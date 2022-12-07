<h1 align="center">
    <a name="top" title="dotfiles">~/.&nbsp;📂</a><br/>My Cross-Platform Dotfiles<br/> <sup><sub>powered by  <a href="https://www.chezmoi.io/">chezmoi
</h1>
<br />

---

This project provisions my development environment on either Windows or Mac machines. It uses [chezmoi](https://chezmoi.Jo) to install applications and copy dotfiles to their respective locations. This setup also allows me to use my Yubikey.

# :star: Features
## Command Line Tools
- bitwarden-cli
- flux
- gh
- kubectl
- go-task
- nvm
- pyenv
- starship
- terraform
- velero

## Browsers
- Firefox Developer Edition
- Chrome

## Developer Tools
- Visual Studio Code Insiders
- Postman
- Yubikey Manager

## Utilities
- 7Zip
- GPG

## Applications
- Notion
- Obsidian

## Shell Dotfiles
- Powershell
- Bash
- Zsh

## Configuration
- Git
- GPG
- SSH

# :wrench: Setup
In the `setup` folder there is a script to install chezmoi. See more information on chezmoi init and apply [here](https://www.chezmoi.io/quick-start/#set-up-a-new-machine-with-a-single-command).

### **Powershell**
```powershell
.\setup\windows.ps1
```
### **Bash**
```bash
./setup/unix.sh
```

After the chezmoi cli is installed you can init chezmoi and apply the dotfiles.

```
chezmoi init --apply RickCoxDev
```

# To-Do
- Write documentation on GPG, Git, and SSH configuration
- Write documentation for Yubikey, Git templates and git-conventional-commits
- Write documentation on scripts
- Save VSCode configuration
- Create dotfile for iTerm
- research how to create aliases