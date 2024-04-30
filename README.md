## ![SFDMU](https://github.com/forcedotcom/SFDX-Data-Move-Utility/blob/master/src/images/logo-black.png)&nbsp;SFDMU GUI Application Overview

The **SFDMU GUI App** enhances the efficiency of creating and managing data migrations within Salesforce environments. This tool is a graphical interface for creating and maintaining the **export.json** configuration file used by the [**SFDX Data Move Utility (SFDMU) plugin**](https://github.com/forcedotcom/SFDX-Data-Move-Utility), facilitating the management of sObjects, fields, and organization connections to enhance accuracy and efficiency in data migration tasks.

## Useful Resources

- **Detailed Documentation of SFDMU GUI App**: [SFDMU GUI App Reference Guide](https://help.sfdmu.com/sfdmu-gui-app).
- **SFDMU Plugin Repository**: [SFDX Data Move Utility](https://github.com/forcedotcom/SFDX-Data-Move-Utility).
- **SFDMU Knowledgebase and Documentation Portal**: [SFDMU Help Center](https://help.sfdmu.com/).

## Application Benefits

The **SFDMU GUI App** offers several advantages that enhance user productivity and ensure secure data handling:

- **Ease of Use**: The intuitive graphical interface simplifies the configuration of migration tasks for the **SFDMU Plugin**, making complex operations more accessible even to users with limited technical skills.
- **Visual Management**: Users can easily add, modify, or remove migration components such as sObjects and field mappings, offering a clear visual representation of changes. This approach helps users better manage and organize their data migration tasks.
- **Error Reduction**: The application detects common configuration and metadata mistakes made during manual `export.json` file editing, enhancing the reliability of data migrations.
- **Secure Data Handling**: All data is processed locally on the client's machine, with the only exception being interaction with the Salesforce REST API, ensuring that data remains secure and is handled in compliance with strict privacy and security policies.

## Supported OS

The application is developed using the [ElectronJS](https://www.electronjs.org/) framework and supports:

- Major operating systems including Windows, macOS, and Linux.
- Requires Windows 10 or newer for Windows users.
- Only x64 CPU architecture is supported.

## Installation and Running
Installing and running the **release version** of the SFDMU GUI App is straightforward, even for users with minimal technical expertise. 
- All releases were made using the [Electron Forge Framework](https://www.electronforge.io/).
- All releases are available on the "release" branch of the SFDMU GUI App GitHub repository.
- You can find the MD5 hash sums in the respective `.md5` files located in the same repository folder as the setup file.
- Release setup executables are available for versions v4.5.0 and later. Older versions must be installed and run directly from the source code.

### Prerequisites

Ensure the [SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm) is installed before using the SFDMU GUI App.

### Installation of Latest Release

Download and install the latest release of the SFDMU GUI App for your operating system:

- **macOS**: Access the `zip` installation file here: [macOS x64 setup](https://github.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App/tree/release/dist/darwin/x64/).
- **Linux (Debian-based systems)**: Access the `deb` installation file here: [Debian x64 setup](https://github.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App/tree/release/dist/deb/x64/).
- **Linux (RPM-based systems)**: Access the `rpm` installation file here: [RPM x64 setup](https://github.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App/tree/release/dist/rpm/x64/).
- **Windows**: Access the `zip` file containing the setup executable here: [Windows x64 setup](https://github.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App/tree/release/dist/windows/x64/).

To install:

1. Click on the file link provided for your operating system to navigate to the download page.
2. Once on the page, use the download link located at the top right to download the file.
3. Follow the steps specific to your operating system for installation and running the application as detailed in **Steps 3 and 4** below.

### Installation of Specific Release

For those wishing to run a specific release of the SFDMU GUI App:

#### Step 1. Select the Release Tag

Navigate to the repository page, locate the "Releases" section on the sidebar, and click on the release tag associated with your desired version.

#### Step 2. Download the Setup Files

Download the appropriate setup file for your OS from the subdirectories under `dist/`:

- **macOS**: Navigate to `dist/darwin/x64/` and download the file, e.g., `sfdmu-gui-app-darwin-x64-X.X.X.zip`.
- **Linux (Debian-based)**: Go to `dist/deb/x64/` and download `sfdmu-gui-app_X.X.X_amd64.deb`.
- **Linux (RPM-based)**: Visit `dist/rpm/x64/` and download `SFDMU-GUI-App-X.X

.X-1.x86_64.rpm`.
- **Windows**: Find `dist/windows/x64/` and download the zip package, e.g., `sfdmu-gui-app-X.X.X Setup.zip`.

#### Step 3. Install the Application

Follow the installation instructions provided for each operating system:

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

#### Step 4. Run the Application

##### macOS:

1. Open a Terminal window.

2. Execute the following command to run the application:

   ```bash
   /Applications/sfdmu-gui-app.app/Contents/MacOS/sfdmu-gui-app
   ```

##### Linux:

1. Use the application menu to launch the SFDMU GUI App.

##### Windows:

1. The app typically launches automatically after installation. For later use, locate it via the Start menu or a desktop shortcut.

## Running the Application from Source Code

Alternatively, instead of using the installable executable, you can clone the source code and run the application directly from it. Detailed documentation for this process is available for guidance.

---

**For comprehensive details on installation, operation, and configuration, visit the** [SFDMU GUI App Documentation](https://help.sfdmu.com/sfdmu-gui-app).
