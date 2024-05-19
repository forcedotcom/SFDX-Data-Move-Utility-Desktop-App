# ![SFDMU](https://github.com/forcedotcom/SFDX-Data-Move-Utility/blob/master/src/images/logo-black.png)&nbsp;SFDMU GUI Desktop Application

The **SFDMU GUI Desktop Application** is a comprehensive tool for Salesforce data migration between SF environments or importing/exporting CSV data into SF environments. It builds upon the capabilities of the **[SFDX Data Move Utility Plugin (SFDMU)](https://github.com/forcedotcom/SFDX-Data-Move-Utility)**, offering a user-friendly interface for seamless data management tasks.

### Useful Resources

- **Knowledgebase and Help Portal**: [SFDMU Help Center](https://help.sfdmu.com/).
- **SFDMU GUI Desktop App Detailed Documentation**: [SFDMU GUI App Reference Guide](https://help.sfdmu.com/sfdmu-gui-app).

## Benefits of the SFDMU GUI Desktop Application

The SFDMU GUI Desktop Application is an open-source and cost-free application that provides numerous advantages, streamlining user workflows and ensuring the secure handling of data:

- **All-In-One Functionality:** Users can configure and execute migration tasks seamlessly within the application itself.
  
- **User-Friendly Interface:** The intuitive graphical interface simplifies the creation and management of the `export.json` file for the SFDMU Plugin. Even users with limited technical expertise can easily set up complex migration tasks.
  
- **Visual Management:** Users can conveniently add, edit, or remove migration components such as sObjects and field mappings. This visual representation facilitates better organization and control over data migration processes.
  
- **Error Prevention:** The application identifies common configuration and metadata errors that may occur during manual editing of the `export.json` file. This feature minimizes the risk of errors, thereby enhancing the reliability of data migrations.
  
- **Secure Data Processing:** All data processing occurs locally on the user's device, except for interactions with the Salesforce REST API. This approach ensures data security and compliance with stringent privacy regulations and security protocols.

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

- Ensure the [SF CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm) is installed before using the SFDMU GUI App.
- Install the [SFDX Data Move Utility Plugin (SFDMU)](https://github.com/forcedotcom/SFDX-Data-Move-Utility?tab=readme-ov-file#installation-instructions).

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

Alternatively, instead of using the installable executable, you can clone the source code and run the application directly from it. 
Detailed documentation for this process is [available for guidance](https://help.sfdmu.com/sfdmu-gui-app#installation-of-the-source-code).

