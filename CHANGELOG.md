### v4.10.2
**Fixes**
- Fetch target object metadata when mapped to another object
- Resolved the issue where an unnecessary trailing semicolon was added after the composite `externalId`

### v4.10.0
**New:**
- Added support for the &#39;valueSource&#39; property of the &#39;core:RecordsTransform&#39; Add-On module
- Default Object Set is now automatically created when a new configuration is created.
- Added notification for new application version availability in the repository.
- Added a CHANGELOG.md file for improved change tracking.

**Fixes:**
- Allow independent editing of &#39;excludedFromUpdateFields&#39; and &#39;excludedFields&#39; properties, ensuring they are not removed when missing from the main query
- Fixed the issue of including fields that do not exist in both organizations in the query test tab.
- Fixed the issue of including fields that do not exist in both orgs in the query test tab.
- Corrected the link to the help documentation for the --path CLI flag.
- Expand/collapse arrow is placed at the start of the accordion tab button.

### v4.9.0
**New:**
- Introduced the ability to edit the `contentDocumentLinkOrderBy` property in the **core:ExportFiles Add-On Module.**
- Added functionality to open the source or target org directly in the browser from within the application.

**Fixes:**
- Resolved an issue where flags were not being added to the CLI string when selected in the CLI editor.
- Fixed the grouping issue of CLI flags in the CLI editor.

### v4.8.1
**New:**
- Added support for custom anonymization patterns.
- Introduced the Object Set cloning feature.

**Fixes:**
- Implemented various UI improvements.

### v4.7.0
**New:**
- **Visual Editor Upgrade:** The Add-On Visual Editor has been upgraded for enhanced functionality.
- **Configuration File Relocation:** The `app-config.json` file has been moved to the standard configuration folder based on the operating system.
- **In-App Configuration UI:** A new user interface has been added, enabling direct application configuration from within the app.
- **Help Center Integration:** Contextual links to the SFDMU Help Center have been added for easier access to documentation.

**Fixes:**
- Addressed various minor issues.

### v4.5.1
**New:**
- Introduced the Visual Editor for simplified Add-Ons management.
- Added the option to collapse/expand the object selector pane, providing increased page space in the object editor.

**Fixes:**
- Improved UI by eliminating extra spaces between elements for better use of page space.

### v4.5.0
Initial release of v5.X.X containing a packaged installable executable of the application.

**New:**
- Ability to install the application executable without the need to clone the repository.
- Each executable includes an MD5 hash sums file for integrity verification.

### v4.4.4
**New:**
- Application settings have been moved from `export.json` to a dedicated file: `documents/app-config.json`.

### v4.4.3
The last release proposes application setup via the `export.json` file before moving the settings to the dedicated `app-config.json`.

**Fixes:**
- Improved the footer bar for better functionality.

### v4.0.0
The initial release of v4.X.X of the application.

### v3.1.16
The final release of the v3.X.X series of the application.