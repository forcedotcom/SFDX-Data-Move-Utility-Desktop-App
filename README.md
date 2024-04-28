## SFDMU GUI Application Overview

The **SFDMU GUI App** enhances the efficiency of creating and managing data migrations within Salesforce environments. 

This tool acts as a valuable extension of the [**SFDX Data Move Utility (SFDMU) plugin**](https://github.com/forcedotcom/SFDX-Data-Move-Utility), providing a graphical interface that simplifies the setup of complex migrations. Users can visually manage sObjects, fields, and organization connections, which helps improve accuracy and reduce errors in data migration tasks.

## Useful Resources

- **Comprehensive guidance on the SFDMU GUI App is available at the [SFDMU GUI App Documentation](https://help.sfdmu.com/sfdmu-gui-app).**
- **Access additional resources and the SFDMU Plugin Repository [here](https://github.com/forcedotcom/SFDX-Data-Move-Utility).**
- **For detailed documentation and support, refer to the [SFDMU Help Center](https://help.sfdmu.com/).**

## Application Benefits

The **SFDMU GUI App** offers several advantages that enhance user productivity and ensure secure data handling:

- **Ease of Use:** The intuitive graphical interface simplifies the SFDMU Plugin configuration of migration tasks, even for users with limited technical skills, making complex operations more accessible.
- **Visual Management:** Users can easily add, modify, or remove migration components such as sObjects and field mappings, offering a clear visual representation of changes. This visual approach helps users better manage and organize their data migration tasks.
- **Error Reduction:** By minimizing common configuration mistakes made during manual file editing, the graphical interface enhances the reliability of data migrations.
- **Secure Data Handling:** All data is processed locally on the client’s machine, with no data sent to any third parties over the internet. All external interactions occur exclusively with the Salesforce REST API, ensuring your data remains secure and is handled in compliance with stringent privacy and security policies.

## Supported OS

The application is developed using the [ElectronJS](https://www.electronjs.org/) framework, and supports:

- Major operating systems including Windows, macOS, and Linux.
- Requires Windows 10 or newer for Windows users.
- Only **x64** CPU architecture is supported.

## Application Quick Start

Installing and running the **release version** of the SFDMU GUI App is straightforward, even for users with minimal technical expertise.

All releases were made using the [Electron Forge Framework](https://www.electronforge.io/).

### Prerequisites

Ensure the [SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm) is installed before using the SFDMU GUI App.

### Installation Steps

**All releases can be found in the ["release"](https://github.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App/tree/release?tab=readme-ov-file) branch of the SFDMU GUI App GitHub repository.**

#### Step 1. Select the Release Tag

Navigate to the repository page, locate the "Releases" section on the sidebar, and click on the release tag associated with your desired version.

#### Step 2. Download the Setup Files

Download the appropriate setup file for your OS from the subdirectories under `dist/`:

- **macOS**:
  - Go to `dist/darwin/x64/` and download the file, e.g., `sfdmu-gui-app-darwin-x64-X.X.X.zip`.
- **Linux (Debian-based systems)**:
  - Navigate to `dist/deb/` and download `sfdmu-gui-app_X.X.X_amd64.deb`.
- **Linux (RPM-based systems)**:
  - Visit `dist/rpm/` and download `SFDMU-GUI-App-X.X.X-1.x86_64.rpm`.
- **Windows**:
  - Find `dist/windows/x64/` and download the zip package, e.g., `sfdmu-gui-app-X.X.X Setup.zip`.

#### Step 3. Install the Application

Follow the instructions below based on your operating system to complete the installation:

##### macOS:
1. Open `Downloads`, find the `.zip` file, and extract it to get the `sfdmu-gui-app.app`.
2. Move the application to your `Applications` folder.

##### Linux (Debian-based):
1. Open a terminal.
2. Go to `Downloads`:
   ```bash
   cd ~/Downloads
   ```
3. Install with:
   ```bash
   sudo dpkg -i sfdmu-gui-app_X.X.X_amd64.deb
   ```

##### Linux (RPM-based):
1. Open a terminal.
2. Navigate to `Downloads`:
   ```bash
   cd ~/Downloads
   ```
3. Install using:
   ```bash
   sudo rpm -i SFDMU-GUI-App-X.X.X-1.x86_64.rpm
   ```

##### Windows:
1. Go to the download location, extract the `.zip` file, and run `sfdmu-gui-app-X.X.X Setup.exe`.
2. The app will auto-launch after installation, creating shortcuts on your desktop and in the Start menu.

### Running the Application

- **macOS:** Open `sfdmu-gui-app.app` from your `Applications` folder.
- **Linux:** Use the application menu to launch the SFDMU GUI App.
- **Windows:** The app typically launches automatically after installation; for later use, find it via the Start menu or desktop shortcut.

## Running the Application from Source Code

Alternatively, instead of using the installable executable, you can clone the source code and run the application directly from it. Please refer to the detailed documentation for guidance.

---

**For comprehensive details on installation, operation, and configuration, visit the** [SFDMU GUI App Documentation](https://help.sfdmu.com/sfdmu-gui-app).
