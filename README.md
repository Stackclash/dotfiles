<h1 align="center">
  <img style="width: 200px; height: 200px" src="https://miro.medium.com/max/700/1*ayVl2ie6CS0Flqr8TxoYgQ.png">
  <br />
  My Dotfiles
</h1>
<br />

---

This project provisions my development environment on either Windows or Mac machines. It uses ansible to install applications and symlink dotfiles to their respective locations.

# :wrench: Setup

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