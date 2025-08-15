# 

`pip3 install SuperGemini                       < 127 ✘ < 12:03:52 ⨀`

```shell
error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try brew install
    xyz, where xyz is the package you are trying to
    install.

    If you wish to install a Python library that isn't in Homebrew,
    use a virtual environment:

    python3 -m venv path/to/venv
    source path/to/venv/bin/activate
    python3 -m pip install xyz

    If you wish to install a Python application that isn't in Homebrew,
    it may be easiest to use 'pipx install xyz', which will manage a
    virtual environment for you. You can install pipx with

    brew install pipx

    You may restore the old behavior of pip by passing
    the '--break-system-packages' flag to pip, or by adding
    'break-system-packages = true' to your pip.conf file. The latter
    will permanently disable this error.

    If you disable this error, we STRONGLY recommend that you additionally
    pass the '--user' flag to pip, or set 'user = true' in your pip.conf
    file. Failure to do this can result in a broken Homebrew installation.

    Read more about this behavior here: <https://peps.python.org/pep-0668/>

note: If you believe this is a mistake, please contact your Python installation or OS distribution provider. You can override this, at the risk of breaking your Python installation or OS, by passing --break-system-packages.
hint: See PEP 668 for the detailed specification.
```

해당 오류를 살펴보자. externally-managed-environment는 ---

`pipx install SuperGemini`

```
  installed package supergemini 3.1.4, installed using Python 3.13.6
  These apps are now globally available
    - SuperGemini
done! ✨ 🌟 ✨
```

```shell
SuperGemini install --quick --yes     
[INFO] Executing operation: install
[INFO] Starting install operation
2025-08-13 12:05:01,786 - SECURITY - INFO - [ALLOW] Gemini directory installation validated: /Users/kwontaewan/.gemini (PID: 76209)
[INFO] [ALLOW] Gemini directory installation validated: /Users/kwontaewan/.gemini (PID: 76209)

============================================================
              SuperGemini Installation v3.1.4
        Installing SuperGemini framework components
============================================================

[INFO] Initializing installation system...
[INFO] Validating system requirements...
[✓] All system requirements met
[!] Installation directory already exists: /Users/kwontaewan/.gemini

Installation Plan
==================================================
Installation Directory: /Users/kwontaewan/.gemini
Components to install:
  1. core - SuperGemini framework documentation and core files
  2. commands - SuperGemini slash command definitions

Estimated size: 147.2 KB

[INFO] Installing 2 components...
Creating backup of existing installation...

Installing core...
2025-08-13 12:05:01,798 - SECURITY - INFO - [ALLOW] Gemini directory installation validated: /Users/kwontaewan/.gemini (PID: 76209)
[INFO] [ALLOW] Gemini directory installation validated: /Users/kwontaewan/.gemini (PID: 76209)
[INFO] Installing SuperGemini core framework files...
2025-08-13 12:05:01,800 - SECURITY - INFO - [ALLOW] Gemini directory installation validated: /Users/kwontaewan/.gemini (PID: 76209)
[INFO] [ALLOW] Gemini directory installation validated: /Users/kwontaewan/.gemini (PID: 76209)
[✓] <CoreComponent(core)> component installed successfully (9 files)
[INFO] Updated metadata with framework configuration
[INFO] Updated metadata with core component registration

Installing commands...
[INFO] Installing SuperGemini command definitions...
[✓] <CommandsComponent(commands)> component installed successfully (17 files)
[INFO] Converted 17 command files to TOML format with MCP flag support
[INFO] Updated metadata with commands configuration
[INFO] Updated metadata with commands component registration

Running post-installation validation...
  ✓ core: Valid
  ✗ commands: Invalid
    - Missing command file: analyze.md
    - Missing command file: build.md
    - Missing command file: cleanup.md
    - Missing command file: design.md
    - Missing command file: document.md
    - Missing command file: estimate.md
    - Missing command file: explain.md
    - Missing command file: git.md
    - Missing command file: implement.md
    - Missing command file: improve.md
    - Missing command file: index.md
    - Missing command file: load.md
    - Missing command file: spawn.md
    - Missing command file: task.md
    - Missing command file: test.md
    - Missing command file: troubleshoot.md
    - Missing command file: workflow.md

Some components failed validation. Check errors above.
Installing: [██████████████████████████████████████████████████..
[✓] Installation completed successfully in 0.2 seconds
[INFO] Installed components: core, commands
[INFO] Backup created: /Users/kwontaewan/.gemini/backups/supergemini_backup_20250813_120501.tar.gz
[✓] SuperGemini installation completed successfully!

Next steps:
1. Restart your Gemini Code session
2. Framework files are now available in /Users/kwontaewan/.gemini
3. Use SuperGemini commands and features in Gemini Code
```