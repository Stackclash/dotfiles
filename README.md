<h1 align="center">
  <img style="width: 200px; height: 200px" src="https://miro.medium.com/max/700/1*ayVl2ie6CS0Flqr8TxoYgQ.png">
  <br />
  My Dotfiles
</h1>
<br />

---

This project provisions my development environment on either Windows or Mac machines. The steps to complete differ between Windows and Macs so please follow the steps for the system you are using. It uses ansible to install applications and copy dotfiles to their respective locations. This setup also allows me to use my Yubikey.

---

**NOTE**
This setup also allows me to use my Yubikey for encryption and Git commit signing. The Mac setup is easy and is done with the required dotfiles, but Windows requires extra steps. So if you are using Windows and don't have a Yubikey feel free to skip these steps.

---

https://justyn.io/blog/using-a-yubikey-for-gpg-in-wsl-windows-subsystem-for-linux-on-windows-10/
https://github.com/drduh/YubiKey-Guide#create-configuration

# :wrench: Setup

# Windows

# Mac

## Prerequisites

The only things you need to have installed to setup is having the following installed:

- python
- git

## Setup Project

1. Setup a python virtual environment by running the following command:
    ```bash
    python3 -m venv ./venv
    ```
2. Activate the virtual environment:
    
    Windows:
    ```bash
    venv\Scripts\activate.bat
    ```
    Mac (bash):
    ```bash
    source venv/bin/activate
    ```
    Mac (fish):
    ```bash
    . venv/bin/activate.fish
    ```
3. Install Python dependencies:
   ```bash
   python install -r requirments.txt
   ```
4. Install Ansible-Galaxy roles:
   ```bash
   ansible-galaxy install -r requirements.yaml
   ```

# :building_construction: Project Structure
|  File/Folder  |                                Purpose                               |
|:-------------:|:--------------------------------------------------------------------:|
| apps.json     | App names and the method of installation                             |
| dotfiles.json | References files in the dotfiles folder and gives their destinations |
| dotfiles/     | Dotfile configurations                                               |
| scripts/      | Scripts for installing applications that require them                |
| ansible/      | Ansible playbooks and roles for provisioning a machine               |

# :book: Ansible Playbooks, Roles, and Tasks
## Playbooks
Note: All playbooks assume you run them from project's root directory.
- bootstrap.yaml: Installs applications and symlinks dotfiles

## Roles
- apps: Installs applications from `apps.json` using various methods
- symlink: Symlinks the files from `dotfiles.json` to the appropriate destinations
- vscode: Installs VSCode extensions from `dotfiles/vscode/extensions.txt`


# Steps to complete
1. Find a terminal to use for Windows -> wsl
2. Find a way to get working directory for new terminal to copy dotfiles to.
3. Setup installation steps for brew, brew-cask, chocolately, and scoop
4. Come up with way of installing FiraCode Nerd Font Mono for both Mac and Windows

# Steps to complete for Windows for WSL and Yubikey
1. Install WSL2 and Ubuntu
2. Install GPG4Win
3. Enable putty and ssh support in Windows GPG
4. Download npiperelay and place it in a directory accessable by WSL and Windows
5. Create a Windows shortcut to run `"C:\Program Files (x86)\GnuPG\bin\gpg-connect-agent.exe" /bye` on login
6. Create gpg-agent-relay.sh and add line in ~/.bashrc to run it on login