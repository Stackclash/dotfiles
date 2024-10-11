# Setup
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
chezmoi init --apply Stackclash
```
